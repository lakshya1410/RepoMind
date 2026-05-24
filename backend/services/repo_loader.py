import os
import shutil
import stat
from git import Repo


REPO_BASE_PATH = "repositories"


def remove_readonly(func, path, _):
    os.chmod(path, stat.S_IWRITE)
    func(path)


def clone_github_repo(repo_url):

    if not os.path.exists(REPO_BASE_PATH):
        os.makedirs(REPO_BASE_PATH)

    # Handle repo_url validation and name extraction
    if not repo_url or not repo_url.startswith(("http://", "https://")):
        raise ValueError("Invalid repository URL. Please provide a valid HTTP/HTTPS URL.")

    repo_name = repo_url.rstrip("/").split("/")[-1]
    if not repo_name:
        raise ValueError("Could not extract repository name from URL.")

    local_path = os.path.join(REPO_BASE_PATH, repo_name)

    # delete old repo safely
    if os.path.exists(local_path):
        try:
            shutil.rmtree(local_path, onerror=remove_readonly)
        except Exception as e:
            print(f"Warning: Could not remove existing repository at {local_path}: {e}")
            # Instead of failing, we can try to clone into a different directory or
            # just proceed and let Repo.clone_from fail if the directory is not empty.
            # For now, we'll let it proceed, but we should probably handle the "destination path already exists" error.

    try:
        Repo.clone_from(repo_url, local_path)
    except Exception as e:
        print(f"Error cloning repository {repo_url}: {e}")
        raise e

    return local_path