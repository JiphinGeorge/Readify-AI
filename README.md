# Readify AI - Transform PDFs into Audiobooks

Readify AI is a web application that allows users to upload PDF documents and convert them into high-quality audiobooks using AI-powered text-to-speech.

## Features
- **Smart PDF Extraction:** Extracts text from uploaded PDF documents.
- **Natural Voices:** AI-powered speech synthesis with multiple language support (English, Malayalam, Hindi, Tamil).
- **Interactive Player:** Built-in audio player with playback controls (play/pause, rewind, fast forward, speed control).
- **Responsive Design:** Premium dark theme with animated backgrounds, built with vanilla HTML/CSS/JS.
- **Background Processing:** Asynchronous audio generation using background threads.

## Technologies Used
- Backend: Flask (Python)
- Text Extraction: PyPDF2
- Text-to-Speech: gTTS (Google Text-to-Speech)
- Frontend: HTML5, CSS3, JavaScript (Vanilla)

## Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Readify AI"
   ```

2. **Create a virtual environment (Optional but recommended):**
   ```bash
   python -m venv venv
   # On Windows use:
   venv\Scripts\activate
   # On macOS/Linux use:
   # source venv/bin/activate
   ```

3. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   python app.py
   ```

5. **Access the application:**
   Open your web browser and navigate to `http://127.0.0.1:5000`.

## Testing
Run the included test script to verify core functionalities:
```bash
python test_app.py
```
