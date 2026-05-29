import os
import uuid
import threading
from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from gtts import gTTS

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
AUDIO_FOLDER = 'audio'
ALLOWED_EXTENSIONS = {'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['AUDIO_FOLDER'] = AUDIO_FOLDER

# Simple in-memory job store
# Format: { 'job_id': { 'status': 'processing' | 'completed' | 'error', 'audio_url': '...', 'message': '...' } }
jobs = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(filepath):
    """Extract text from the PDF file and return the text and page count."""
    reader = PdfReader(filepath)
    num_pages = len(reader.pages)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text, num_pages

def generate_audio_task(job_id, text, lang, filename_base):
    """Background task to generate audio."""
    try:
        # Create audio file
        audio_filename = f"{filename_base}.mp3"
        audio_filepath = os.path.join(app.config['AUDIO_FOLDER'], audio_filename)
        
        # gTTS generation
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(audio_filepath)
        
        # Update job status
        jobs[job_id]['status'] = 'completed'
        jobs[job_id]['audio_filename'] = audio_filename
        jobs[job_id]['audio_url'] = f"/audio/{audio_filename}"
    except Exception as e:
        jobs[job_id]['status'] = 'error'
        jobs[job_id]['message'] = str(e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'pdf_file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['pdf_file']
    lang = request.form.get('lang', 'en')
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Create unique filename to prevent overwrites
        unique_id = str(uuid.uuid4())
        safe_filename = f"{unique_id}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], safe_filename)
        file.save(filepath)
        
        try:
            # Extract text
            text, num_pages = extract_text_from_pdf(filepath)
            
            if not text.strip():
                return jsonify({'error': 'No extractable text found in this PDF.'}), 400
                
            # Create a job
            job_id = unique_id
            jobs[job_id] = {
                'status': 'processing',
                'pages': num_pages,
                'char_count': len(text)
            }
            
            # Start background thread for audio generation
            thread = threading.Thread(target=generate_audio_task, args=(job_id, text, lang, unique_id))
            thread.start()
            
            return jsonify({
                'message': 'File uploaded successfully',
                'job_id': job_id,
                'pages': num_pages,
                'char_count': len(text)
            })
            
        except Exception as e:
            return jsonify({'error': f'Failed to process PDF: {str(e)}'}), 500
            
    return jsonify({'error': 'Invalid file format. Only PDF is allowed.'}), 400

@app.route('/status/<job_id>', methods=['GET'])
def check_status(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    return jsonify(job)

@app.route('/audio/<filename>', methods=['GET'])
def get_audio(filename):
    return send_from_directory(app.config['AUDIO_FOLDER'], filename, as_attachment=False)

@app.route('/download/<filename>', methods=['GET'])
def download_audio(filename):
    return send_from_directory(app.config['AUDIO_FOLDER'], filename, as_attachment=True)

if __name__ == '__main__':
    # Ensure directories exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(AUDIO_FOLDER, exist_ok=True)
    app.run(debug=True, port=5000)
