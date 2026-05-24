import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = [".py", ".js", ".java", ".ts", ".cpp", ".h", ".cs", ".go", ".rs"]


def read_code_files(folder_path):
    code_files = []

    if not os.path.exists(folder_path):
        logger.error(f"Folder path {folder_path} does not exist.")
        return code_files

    for root, dirs, files in os.walk(folder_path):

        for file in files:

            file_extension = os.path.splitext(file)[1]

            if file_extension in SUPPORTED_EXTENSIONS:

                full_path = os.path.join(root, file)

                try:
                    # Using utf-8 with 'replace' to avoid UnicodeDecodeError on binary or weirdly encoded files
                    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                        content = f.read()

                    code_files.append({
                        "file_name": file,
                        "path": full_path,
                        "content": content
                    })

                except Exception as e:
                    logger.error(f"Error reading {file}: {e}")

    return code_files