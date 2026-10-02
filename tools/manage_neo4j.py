import os
import sys
import time
import zipfile
import urllib.request
import subprocess
from pathlib import Path

NEO4J_VERSION = "5.26.0"
NEO4J_ZIP_URL = f"https://dist.neo4j.org/neo4j-community-{NEO4J_VERSION}-windows.zip"
BASE_DIR = Path(__file__).resolve().parent.parent
SCRATCH_DIR = BASE_DIR.parent
ZIP_PATH = SCRATCH_DIR / f"neo4j-community-{NEO4J_VERSION}-windows.zip"
SERVER_DIR = SCRATCH_DIR / "neo4j-server"

def download_and_extract():
    if not SERVER_DIR.exists():
        if not ZIP_PATH.exists():
            print(f"Downloading Neo4j Community {NEO4J_VERSION} from {NEO4J_ZIP_URL}...")
            def progress(block_num, block_size, total_size):
                downloaded = block_num * block_size
                if total_size > 0:
                    percent = downloaded / total_size * 100
                    if block_num % 1000 == 0:
                        print(f"Downloaded {downloaded / 1024 / 1024:.1f} MB / {total_size / 1024 / 1024:.1f} MB ({percent:.1f}%)")
            urllib.request.urlretrieve(NEO4J_ZIP_URL, str(ZIP_PATH), reporthook=progress)
            print("Download completed.")
        
        print("Extracting Neo4j server...")
        with zipfile.ZipFile(str(ZIP_PATH), 'r') as zip_ref:
            zip_ref.extractall(str(SCRATCH_DIR))
        
        extracted_folder = SCRATCH_DIR / f"neo4j-community-{NEO4J_VERSION}"
        if extracted_folder.exists():
            if SERVER_DIR.exists():
                import shutil
                shutil.rmtree(str(SERVER_DIR), ignore_errors=True)
            extracted_folder.rename(SERVER_DIR)
        print(f"Neo4j extracted to {SERVER_DIR}")

def configure_neo4j():
    conf_file = SERVER_DIR / "conf" / "neo4j.conf"
    if conf_file.exists():
        content = conf_file.read_text(encoding="utf-8")
        # Ensure auth is enabled and listen on all addresses
        updated = False
        if "server.default_listen_address=0.0.0.0" not in content:
            content += "\nserver.default_listen_address=0.0.0.0\n"
            updated = True
        if "server.bolt.listen_address=:7687" not in content:
            content += "\nserver.bolt.listen_address=:7687\n"
            updated = True
        if updated:
            conf_file.write_text(content, encoding="utf-8")
            print("Updated neo4j.conf")

def set_initial_password(password="password123"):
    admin_bat = SERVER_DIR / "bin" / "neo4j-admin.bat"
    if admin_bat.exists():
        try:
            cmd = [str(admin_bat), "dbms", "set-initial-password", password]
            print(f"Setting initial password with: {' '.join(cmd)}")
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            print(f"Output: {res.stdout.strip()} {res.stderr.strip()}")
        except Exception as e:
            print(f"Password set notice: {e}")

def start_server():
    neo4j_bat = SERVER_DIR / "bin" / "neo4j.bat"
    if not neo4j_bat.exists():
        print(f"Cannot find {neo4j_bat}")
        return
    
    print("Starting Neo4j server console in background...")
    cmd = [str(neo4j_bat), "console"]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
    print(f"Neo4j process started with PID {proc.pid}")
    
    # Wait for Neo4j to be available
    import socket
    start_time = time.time()
    while time.time() - start_time < 60:
        try:
            with socket.create_connection(("localhost", 7687), timeout=2):
                print("Neo4j Bolt port 7687 is OPEN and ready!")
                return proc
        except Exception:
            time.sleep(2)
            print("Waiting for Neo4j port 7687...")
    print("Timed out waiting for port 7687, but process is running.")
    return proc

if __name__ == "__main__":
    download_and_extract()
    configure_neo4j()
    set_initial_password("password123")
    start_server()
