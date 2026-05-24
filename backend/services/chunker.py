import re


import re

def chunk_code(code_files):
    chunks = []

    for file in code_files:
        content = file["content"]

        # Improved chunking: split by common function/class definitions across languages
        # Python: def, class | JS/TS: function, class, const ... = (...) =>
        patterns = [
            r'\ndef\s+',
            r'\nclass\s+',
            r'\nfunction\s+',
            r'\nclass\s+',
            r'\nconst\s+\w+\s*=\s*\(\s*\)\s*=>'
        ]

        # Combine patterns into one regex
        combined_pattern = '|'.join(patterns)
        split_chunks = re.split(f'({combined_pattern})', content)

        # re.split with capturing group returns the delimiters as well
        # split_chunks will look like: [prefix, delimiter, chunk, delimiter, chunk...]

        current_chunk = split_chunks[0]
        for i in range(1, len(split_chunks), 2):
            delimiter = split_chunks[i]
            body = split_chunks[i+1] if i+1 < len(split_chunks) else ""

            # First, save the previous chunk if it's not just whitespace
            if current_chunk.strip():
                chunks.append({
                    "file_name": file["file_name"],
                    "path": file["path"],
                    "chunk": current_chunk.strip()
                })

            current_chunk = delimiter + body

        # Add the final chunk
        if current_chunk.strip():
            chunks.append({
                "file_name": file["file_name"],
                "path": file["path"],
                "chunk": current_chunk.strip()
            })

    return chunks