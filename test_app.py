import os
import time
import requests
from PyPDF2 import PdfWriter, PdfReader

BASE_URL = "http://127.0.0.1:5000"

def create_test_pdf(filename, text="This is a test document."):
    from reportlab.pdfgen import canvas
    c = canvas.Canvas(filename)
    c.drawString(100, 750, text)
    c.save()

def create_empty_pdf(filename):
    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    with open(filename, "wb") as f:
        writer.write(f)

def run_tests():
    print("=== STARTING TESTS ===")
    
    # 1. Server check
    try:
        r = requests.get(BASE_URL)
        if r.status_code == 200:
            print("PASS: Server is running and accessible.")
        else:
            print(f"FAIL: Server returned status {r.status_code}")
    except Exception as e:
        print(f"FAIL: Could not connect to server: {e}")
        return

    # 2. Invalid file type upload
    print("\n--- Testing Invalid File Type ---")
    with open("test.txt", "w") as f:
        f.write("Not a pdf")
    with open("test.txt", "rb") as f:
        r = requests.post(f"{BASE_URL}/upload", files={"pdf_file": f})
        print(f"Status: {r.status_code}, Response: {r.text}")
        if r.status_code == 400 and "Invalid file format" in r.text:
            print("PASS: Invalid file correctly rejected.")
        else:
            print("FAIL: Invalid file not rejected properly.")

    # 3. Valid PDF Upload
    print("\n--- Testing Valid PDF Upload & Audio Generation ---")
    create_test_pdf("test_valid.pdf", "Hello, this is a valid test document for Readify AI.")
    job_id = None
    with open("test_valid.pdf", "rb") as f:
        r = requests.post(f"{BASE_URL}/upload", files={"pdf_file": f}, data={"lang": "en"})
        print(f"Status: {r.status_code}, Response: {r.json()}")
        if r.status_code == 200:
            print("PASS: Valid PDF uploaded.")
            data = r.json()
            job_id = data.get("job_id")
        else:
            print("FAIL: Valid PDF upload failed.")

    # 4. Polling for audio generation
    if job_id:
        print("\n--- Testing Polling for Job Completion ---")
        max_retries = 10
        completed = False
        for i in range(max_retries):
            r = requests.get(f"{BASE_URL}/status/{job_id}")
            status_data = r.json()
            status = status_data.get("status")
            print(f"Polling {i+1}: Status = {status}")
            if status == "completed":
                print("PASS: Audio generation completed successfully.")
                completed = True
                break
            elif status == "error":
                print(f"FAIL: Audio generation error: {status_data.get('message')}")
                break
            time.sleep(2)
        
        if not completed:
            print("FAIL: Audio generation timed out or failed.")

    # 5. Empty PDF Upload
    print("\n--- Testing Empty PDF Upload ---")
    create_empty_pdf("test_empty.pdf")
    with open("test_empty.pdf", "rb") as f:
        r = requests.post(f"{BASE_URL}/upload", files={"pdf_file": f}, data={"lang": "en"})
        print(f"Status: {r.status_code}, Response: {r.json()}")
        if r.status_code == 400 and "No extractable text" in r.text:
            print("PASS: Empty PDF correctly rejected.")
        else:
            print("FAIL: Empty PDF not rejected properly.")

    # Cleanup
    for f in ["test.txt", "test_valid.pdf", "test_empty.pdf"]:
        if os.path.exists(f):
            os.remove(f)
            
    print("\n=== TESTS COMPLETED ===")

if __name__ == "__main__":
    run_tests()
