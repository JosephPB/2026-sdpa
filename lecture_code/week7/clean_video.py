"""Remove the external labels from the supplied animation; preserve its channel motion.

Optional dependency: imageio-ffmpeg. The original MOV is retained unchanged.
"""
from pathlib import Path
import subprocess,imageio_ffmpeg
root=Path(__file__).resolve().parent
exe=imageio_ffmpeg.get_ffmpeg_exe()
filters=[
 'delogo=x=248:y=113:w=64:h=465',
 'delogo=x=981:y=234:w=163:h=252',
 'delogo=x=319:y=92:w=45:h=35',
 'delogo=x=409:y=80:w=46:h=36',
 'delogo=x=499:y=70:w=47:h=35',
 'delogo=x=588:y=60:w=50:h=36',
]
subprocess.run([exe,'-loglevel','error','-i',str(root/'assets/arrays-3d.mov'),'-vf',','.join(filters),'-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(root/'assets/arrays-3d-clean.mp4'),'-y'],check=True)

# VP9 avoids blank H.264 rendering in the in-app browser; retain H.264 for other browsers.
subprocess.run([exe,'-loglevel','error','-i',str(root/'assets/arrays-3d-clean.mp4'),'-an','-c:v','libvpx-vp9','-crf','28','-b:v','0','-pix_fmt','yuv420p',str(root/'assets/arrays-3d-clean.webm'),'-y'],check=True)
subprocess.run([exe,'-loglevel','error','-ss','0','-i',str(root/'assets/arrays-3d-clean.mp4'),'-frames:v','1',str(root/'assets/arrays-3d-poster.png'),'-y'],check=True)
