# Force-reading teaching example

The function assumes finite numerical readings and a finite threshold, all in newtons. It returns one Boolean per reading, includes equality and preserves input order. Empty input returns an empty list.

From this folder:

```bash
python test_force.py --buggy
python -m unittest -v
```

The first command deliberately fails one boundary test. The corrected version passes the same four tests. No third-party packages or AI account are needed.

Data validation is outside this small function's contract. Do not use this example to control equipment or make safety decisions.
