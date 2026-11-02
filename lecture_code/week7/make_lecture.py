"""Regenerate week7_lecture HTML and student PDF from this folder's master."""
import sys
from generate_variants import main

if __name__ == '__main__':
    main(['--only', 'lecture', *sys.argv[1:]])
