"""Regenerate week7_presenter with empty code outputs from this folder's master."""
import sys
from generate_variants import main

if __name__ == '__main__':
    main(['--only', 'presenter', *sys.argv[1:]])
