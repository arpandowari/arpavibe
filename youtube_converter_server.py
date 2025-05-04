from flask import Flask, request, send_file, jsonify
import yt_dlp
import os
import tempfile
import uuid
import logging
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Temporary directory for downloads
TEMP_DIR = tempfile.gettempdir()

@app.route('/ping', methods=['GET'])
def ping():
    """Simple endpoint to check if server is running"""
    return jsonify({"status": "ok", "message": "Server is running"})

@app.route('/convert', methods=['POST'])
def convert_youtube():
    """Convert YouTube video to MP3 and send the file"""
    try:
        # Get URL from request
        data = request.json
        if not data or 'url' not in data:
            return jsonify({"error": "No URL provided"}), 400
            
        youtube_url = data['url']
        logger.info(f"Received conversion request for URL: {youtube_url}")
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}.mp3"
        output_path = os.path.join(TEMP_DIR, filename)
        
        # yt-dlp options
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': output_path.replace('.mp3', ''),  # yt-dlp adds extension automatically
            'quiet': False,
            'no_warnings': False,
            'noprogress': True,
        }
        
        # Download and convert
        logger.info(f"Starting download and conversion to: {output_path}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([youtube_url])
        
        # The actual output file will have .mp3 extension
        actual_output_path = output_path.replace('.mp3', '') + '.mp3'
        
        if not os.path.exists(actual_output_path):
            logger.error(f"Output file not found at: {actual_output_path}")
            return jsonify({"error": "Failed to convert video"}), 500
        
        logger.info(f"Conversion successful, sending file: {actual_output_path}")
        return send_file(
            actual_output_path,
            as_attachment=True,
            download_name=filename,
            mimetype='audio/mpeg'
        )
        
    except Exception as e:
        logger.error(f"Error converting video: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up temp file (if it exists)
        try:
            if 'actual_output_path' in locals() and os.path.exists(actual_output_path):
                os.remove(actual_output_path)
                logger.info(f"Deleted temporary file: {actual_output_path}")
        except Exception as e:
            logger.warning(f"Failed to delete temporary file: {str(e)}")

@app.route('/info', methods=['GET'])
def get_video_info():
    """Get information about a YouTube video without downloading"""
    try:
        youtube_url = request.args.get('url')
        if not youtube_url:
            return jsonify({"error": "No URL provided"}), 400
            
        logger.info(f"Getting info for URL: {youtube_url}")
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'noprogress': True,
            'skip_download': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            
        # Return only relevant information
        video_info = {
            'id': info.get('id'),
            'title': info.get('title'),
            'uploader': info.get('uploader'),
            'duration': info.get('duration'),
            'thumbnail': info.get('thumbnail'),
        }
        
        return jsonify(video_info)
        
    except Exception as e:
        logger.error(f"Error getting video info: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Get port from environment or use default 5000
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')  # Listen on all interfaces
    
    logger.info(f"Starting YouTube MP3 converter server on {host}:{port}")
    app.run(host=host, port=port, debug=True) 