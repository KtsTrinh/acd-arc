p='app/admin/projects/new/page.tsx'
lines=open(p,encoding='utf-8').read().splitlines(keepends=True)
for i,l in enumerate(lines):
    if 'Danh mÃ¡Â»Â¥c:' in l:
        lines[i]='              <label className="text-xs text-slate-300">Danh mục:</label>\n'
    if 'Phong cÃƒÂ¡ch:' in l:
        lines[i]='              <label className="text-xs text-slate-300">Phong cách:</label>\n'
    if 'NÃ„Æ’m hoÃƒÂ n thÃƒÂ nh:' in l:
        lines[i]='              <label className="text-xs text-slate-300">Năm hoàn thành:</label>\n'
open(p,'w',encoding='utf-8').write(''.join(lines))
print('done')
PY