"""Build REEO's original circuit-display lettering. Requires fonttools.
Run: python scripts/circuit-font.py (inside an environment with fonttools).
Glyph centre-lines are original drawings; this does not modify a third-party font.
"""
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from math import sin,cos,pi,hypot
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'public/brand'
def glyph(lines):
    pen=TTGlyphPen(None)
    def poly(points):
        pen.moveTo(points[0])
        for point in points[1:]: pen.lineTo(point)
        pen.closePath()
    def disc(x,y,r=34):
        poly([(round(x+cos(i*2*pi/24)*r),round(y+sin(i*2*pi/24)*r)) for i in range(24)])
    for line in lines:
        for a,b in zip(line,line[1:]):
            dx,dy=b[0]-a[0],b[1]-a[1];length=hypot(dx,dy)
            if not length:continue
            nx,ny=-dy/length*28,dx/length*28
            poly([(round(a[0]+nx),round(a[1]+ny)),(round(a[0]-nx),round(a[1]-ny)),(round(b[0]-nx),round(b[1]-ny)),(round(b[0]+nx),round(b[1]+ny))])
        for x,y in line:disc(x,y,28)
    return pen.glyph()
bowl=[(420+180*cos(pi/2-i*pi/30),520+180*sin(pi/2-i*pi/30)) for i in range(31)]
ring=[(410+250*cos(i*2*pi/64),390+310*sin(i*2*pi/64)) for i in range(65)]
shapes={
 'R': [[(180,80),(180,700),(420,700)],bowl,[(420,340),(180,340)],[(420,340),(650,80)],[(65,540),(180,540)],[(65,420),(180,420)],[(600,520),(710,520)]],
 'E': [[(650,700),(180,700),(180,80),(650,80)],[(180,390),(570,390)],[(65,540),(180,540)],[(570,390),(710,390)]],
 'O': [ring,[(50,390),(160,390)],[(660,390),(770,390)]],
}
font=FontBuilder(1000,isTTF=True)
font.setupGlyphOrder(['.notdef','space','R','E','O'])
font.setupCharacterMap({32:'space',82:'R',69:'E',79:'O'})
font.setupGlyf({'.notdef':glyph([]),'space':glyph([]),**{name:glyph(lines) for name,lines in shapes.items()}})
font.setupHorizontalMetrics({name:(840 if name!='space' else 300,0) for name in ['.notdef','space','R','E','O']})
font.setupHorizontalHeader(ascent=850,descent=-150)
font.setupNameTable({'familyName':'REEO Circuit Display','styleName':'Regular','uniqueFontIdentifier':'REEO-Circuit-Display-1','fullName':'REEO Circuit Display','psName':'REEOCircuitDisplay','version':'Version 1.0','copyright':'Original REEO circuit lettering. Licensed under GPL-3.0-only; see repository LICENSE.'})
font.setupOS2(sTypoAscender=850,sTypoDescender=-150,usWinAscent=850,usWinDescent=150)
font.setupPost();font.save(out/'REEOCircuitDisplay.ttf')
