import os
root = r'C:\Users\eb835\OneDrive - Universidad Cooperativa de Colombia\Documents'
found = []
for dirpath, dirnames, filenames in os.walk(root):
    for fname in filenames:
        fl = fname.lower()
        if any(k in fl for k in ['equid', 'ica']):
            found.append(os.path.join(dirpath, fname))
for f in sorted(found):
    print(f)
