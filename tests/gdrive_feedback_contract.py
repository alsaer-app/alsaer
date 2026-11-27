"""Static contract for the approved Drive button feedback (busy spinner+bar, transient done)."""
from pathlib import Path
R = Path(__file__).resolve().parents[1]
gd = (R / 'src/services/gdrive-backup.js').read_text()
ex = (R / 'src/services/extras.js').read_text()
css = (R / 'src/styles/features9.css').read_text()

assert 'gdPhase' in gd and 'gdDoneKind' in gd and 'gdFlashDone' in gd
assert 'class="gd-spin"' in gd and 'جارٍ الرفع…' in gd and 'جارٍ الاستعادة…' in gd
assert "'btn done'" in gd.replace('"', "'") or 'btn done' in gd
assert 'تم الرفع' in gd and 'تمت الاستعادة' in gd
assert 'gd-prog' in gd and 'aria-hidden="true"' in gd
# manual backup shows busy upload phase, clears in finally, flashes done only on real drive upload
i = gd.index('function gdRunBackup')
seg = gd[i:i+2200]
assert "gdPhase='up'" in seg and 'if(!automatic)' in seg
assert "gdPhase=''" in gd[gd.index('.finally', i):gd.index('.finally', i)+120]
assert "if(!automatic&&driveDue&&driveOK)gdFlashDone('up')" in seg
# restore picker shows busy restore phase and clears it
i = gd.index('function gdLoadPicker')
seg = gd[i:i+900]
assert "gdPhase='down'" in seg and "gdPhase=''" in seg
# restore apply flashes done
assert "gdRestoreApply(gdVerified);gdFlashDone('down')" in gd
# all three button clusters use the helper
assert ex.count("gdBtn('up'") >= 1 and ex.count("gdBtn('down'") >= 1 and 'gdProgBar()' in ex
assert "function gdBtn(" in gd  # the old second cluster (vGdCard) was removed in 4b884bb; the live Drive card is the extras.js one
# CSS from the approved mock
for sel in ['.gd-spin', '.gd-prog', '@keyframes gdProg', '.btn.done', '@keyframes gdDone', 'animation:spin .7s linear infinite']:
    assert sel in css, sel
print('PASS drive feedback: busy spinner + indeterminate bar, transient done, all button clusters, CSS')
