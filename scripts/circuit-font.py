"""Build REEO Circuit Display: an original monoline circuit typeface.

The letterforms are constructed from stroked centrelines on a 1000-unit grid.
Round caps and joins echo solder pads; R, E and O keep the port stubs of the
REEO wordmark. Requires fontTools and skia-pathops.

    python -m pip install fonttools skia-pathops
    python scripts/circuit-font.py
"""

from __future__ import annotations

import datetime
import io
import math
from pathlib import Path

import pathops
from fontTools.agl import UV2AGL as AGL_NAMES
from fontTools.feaLib.builder import addOpenTypeFeatures
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "brand"

UPM = 1000
STROKE = 56
HALF = STROKE / 2
CAP = 700
XHEIGHT = 500
ASCENDER = 880
DESCENDER = -240
TOP = CAP - HALF  # centreline that inks to the cap height
BASE = HALF  # centreline that inks to the baseline
XTOP = XHEIGHT - HALF
XBASE = HALF
DESC_TOP = DESCENDER + HALF

KAPPA = 0.5522847498307936

# Fixed head timestamps keep builds reproducible while avoiding the 1970 default.
FONT_EPOCH = int(datetime.datetime(2026, 11, 21, tzinfo=datetime.UTC).timestamp()) + 2082844800


def _arc_cubics(cx, cy, rx, ry, start, end):
    """Cubic segments approximating an elliptical arc, angles in degrees."""
    sweep = end - start
    count = max(1, math.ceil(abs(sweep) / 90))
    step = math.radians(sweep / count)
    a = math.radians(start)
    for _ in range(count):
        b = a + step
        k = 4 / 3 * math.tan((b - a) / 4)
        x0, y0 = cx + rx * math.cos(a), cy + ry * math.sin(a)
        x1, y1 = cx + rx * math.cos(b), cy + ry * math.sin(b)
        dx0, dy0 = -rx * math.sin(a) * k, ry * math.cos(a) * k
        dx1, dy1 = -rx * math.sin(b) * k, ry * math.cos(b) * k
        yield (x0, y0), (x0 + dx0, y0 + dy0), (x1 - dx1, y1 - dy1), (x1, y1)
        a = b


class Drawing:
    """Collect open centrelines and stroke them into one clean outline."""

    def __init__(self, width: float = STROKE) -> None:
        self.width = width
        self.contours: list[list[tuple]] = []
        self.current: list[tuple] = []

    def _flush(self) -> None:
        if len(self.current) > 1:
            self.contours.append(self.current)
        self.current = []

    def start(self, x: float, y: float) -> "Drawing":
        self._flush()
        self.current = [("m", (x, y))]
        return self

    def separate(self) -> "Drawing":
        """Finish the current centreline so the next arc opens a new contour."""
        self._flush()
        return self

    def line(self, x: float, y: float) -> "Drawing":
        self.current.append(("l", (x, y)))
        return self

    def curve(self, c1, c2, end) -> "Drawing":
        self.current.append(("c", (c1, c2, end)))
        return self

    def arc(self, cx, cy, rx, ry, start, end) -> "Drawing":
        for p0, c1, c2, p1 in _arc_cubics(cx, cy, rx, ry, start, end):
            if not self.current:
                self.start(*p0)
            elif self.current[-1][1] != p0:
                self.line(*p0)
            self.curve(c1, c2, p1)
        return self

    def poly(self, points) -> "Drawing":
        self.start(*points[0])
        for point in points[1:]:
            self.line(*point)
        return self

    def dot(self, x, y) -> "Drawing":
        """A round pad, built as a minimal zero-length stroke."""
        return self.start(x, y).line(x + 0.01, y)

    def finish(self):
        self._flush()
        path = pathops.Path()
        pen = path.getPen()
        for contour in self.contours:
            for verb, args in contour:
                if verb == "m":
                    pen.moveTo(args)
                elif verb == "l":
                    pen.lineTo(args)
                else:
                    pen.curveTo(*args)
            pen.endPath()
        path.stroke(
            self.width,
            pathops.LineCap.ROUND_CAP,
            pathops.LineJoin.ROUND_JOIN,
            4,
        )
        path.convertConicsToQuads(0.2)
        path.simplify(fix_winding=True)
        return path


def make_glyph(drawing: Drawing, lsb=44, rsb=44, advance=None):
    path = drawing.finish()
    if path.bounds is None:
        return TTGlyphPen(None).glyph(), advance or 0
    xmin, ymin, xmax, ymax = path.bounds
    width = xmax - xmin
    if advance is None:
        advance = int(round(width + lsb + rsb))
        dx = lsb - xmin
    else:
        dx = (advance - width) / 2 - xmin
    path.transform(1, 0, 0, 1, dx, 0)
    pen = TTGlyphPen(None)
    path.draw(pen)
    return pen.glyph(), int(round(advance))


def pin(d: Drawing, x0, x1, y):
    d.start(x0, y).line(x1, y)


# ---------------------------------------------------------------- uppercase
def glyph_A():
    d = Drawing()
    d.poly([(100, BASE), (300, TOP), (500, BASE)])
    d.start(175, 240).line(425, 240)
    return make_glyph(d, 26, 26)


def glyph_B():
    d = Drawing()
    d.poly([(150, BASE), (150, TOP), (330, TOP)])
    d.arc(330, 520, 160, 152, 90, -90)
    d.line(150, 368)
    d.arc(330, 200, 180, 172, 90, -90)
    d.line(150, BASE)
    return make_glyph(d, 40, 36)


def glyph_C():
    d = Drawing()
    d.arc(340, 350, 230, 330, 42, 318)
    return make_glyph(d, 28, 24)


def glyph_D():
    d = Drawing()
    d.poly([(150, BASE), (150, TOP), (320, TOP)])
    d.arc(320, 350, 230, 322, 90, -90)
    d.line(150, BASE)
    return make_glyph(d, 40, 26)


def glyph_E():
    d = Drawing()
    d.poly([(150, BASE), (150, TOP), (620, TOP)])
    d.start(50, 350).line(560, 350)
    d.poly([(150, BASE), (620, BASE)])
    return make_glyph(d, 22, 38)


def glyph_F():
    d = Drawing()
    d.poly([(150, BASE), (150, TOP), (620, TOP)])
    d.start(50, 350).line(530, 350)
    return make_glyph(d, 22, 44)


def glyph_G():
    d = Drawing()
    d.arc(340, 350, 230, 330, 40, 330)
    d.line(600, 170)
    d.line(600, 350)
    d.line(430, 350)
    return make_glyph(d, 28, 26)


def glyph_H():
    d = Drawing()
    d.start(150, BASE).line(150, TOP)
    d.start(570, BASE).line(570, TOP)
    d.start(150, 350).line(570, 350)
    return make_glyph(d, 40, 40)


def glyph_I():
    d = Drawing()
    d.start(150, BASE).line(150, TOP)
    return make_glyph(d, 40, 40)


def glyph_J():
    d = Drawing()
    d.start(470, TOP).line(470, 160)
    d.arc(290, 160, 180, 160, 0, -180)
    d.line(110, 300)
    return make_glyph(d, 40, 30)


def glyph_K():
    d = Drawing()
    d.start(150, BASE).line(150, TOP)
    d.start(560, TOP).line(150, 330)
    d.start(300, 410).line(590, BASE)
    return make_glyph(d, 40, 32)


def glyph_L():
    d = Drawing()
    d.poly([(150, TOP), (150, BASE), (600, BASE)])
    return make_glyph(d, 40, 40)


def glyph_M():
    d = Drawing()
    d.poly([(140, BASE), (140, TOP), (390, 300), (640, TOP), (640, BASE)])
    return make_glyph(d, 30, 30)


def glyph_N():
    d = Drawing()
    d.poly([(150, BASE), (150, TOP), (610, BASE), (610, TOP)])
    return make_glyph(d, 40, 40)


def glyph_O():
    d = Drawing()
    d.arc(320, 350, 230, 330, 90, 450)
    pin(d, 40, 120, 350)
    pin(d, 520, 600, 350)
    return make_glyph(d, 24, 24)


def glyph_P():
    d = Drawing()
    d.poly([(150, BASE), (150, TOP), (340, TOP)])
    d.arc(340, 530, 160, 142, 90, -90)
    d.line(150, 388)
    return make_glyph(d, 40, 36)


def glyph_Q():
    d = Drawing()
    d.arc(320, 350, 230, 330, 90, 450)
    d.start(420, 170).line(640, -80)
    return make_glyph(d, 24, 24)


def glyph_R():
    d = Drawing()
    d.poly([(170, BASE), (170, TOP), (410, TOP)])
    d.arc(410, 500, 175, 172, 90, -90)
    d.line(170, 328)
    d.start(410, 328).line(650, BASE)
    pin(d, 50, 170, 590)
    pin(d, 50, 170, 455)
    pin(d, 585, 720, 500)
    return make_glyph(d, 24, 28)


def glyph_S():
    d = Drawing()
    d.start(560, 600)
    d.curve((540, 690), (430, 720), (320, 700))
    d.curve((180, 675), (130, 600), (165, 520))
    d.curve((200, 445), (300, 420), (400, 385))
    d.curve((500, 350), (545, 290), (525, 200))
    d.curve((500, 80), (350, 20), (180, 90))
    return make_glyph(d, 32, 30)


def glyph_T():
    d = Drawing()
    d.start(70, TOP).line(610, TOP)
    d.start(340, BASE).line(340, TOP)
    return make_glyph(d, 32, 34)


def glyph_U():
    d = Drawing()
    d.start(150, TOP).line(150, 190)
    d.arc(350, 190, 200, 180, 180, 360)
    d.line(550, TOP)
    return make_glyph(d, 40, 40)


def glyph_V():
    d = Drawing()
    d.poly([(90, TOP), (310, BASE), (530, TOP)])
    return make_glyph(d, 30, 30)


def glyph_W():
    d = Drawing()
    d.poly([(70, TOP), (200, BASE), (330, 460), (460, BASE), (590, TOP)])
    return make_glyph(d, 26, 26)


def glyph_X():
    d = Drawing()
    d.start(100, TOP).line(540, BASE)
    d.start(540, TOP).line(100, BASE)
    return make_glyph(d, 28, 28)


def glyph_Y():
    d = Drawing()
    d.start(100, TOP).line(320, 350).line(540, TOP)
    d.start(320, BASE).line(320, 350)
    return make_glyph(d, 28, 28)


def glyph_Z():
    d = Drawing()
    d.poly([(120, TOP), (540, TOP), (120, BASE), (540, BASE)])
    return make_glyph(d, 33, 33)


# ---------------------------------------------------------------- lowercase
def glyph_a():
    d = Drawing()
    d.arc(300, 250, 200, 230, 90, 450)
    d.start(500, 20).line(500, 480)
    return make_glyph(d, 30, 30)


def glyph_b():
    d = Drawing()
    d.start(130, 20).line(130, TOP)
    d.separate()
    d.arc(330, 250, 200, 230, 90, 450)
    return make_glyph(d, 30, 30)


def glyph_c():
    d = Drawing()
    d.arc(300, 250, 210, 230, 45, 315)
    return make_glyph(d, 24, 20)


def glyph_d():
    d = Drawing()
    d.start(530, 20).line(530, TOP)
    d.separate()
    d.arc(330, 250, 200, 230, 90, 450)
    return make_glyph(d, 34, 34)


def glyph_e():
    d = Drawing()
    d.arc(300, 250, 210, 230, 0, 300)
    d.start(90, 250).line(510, 250)
    return make_glyph(d, 26, 26)


def glyph_f():
    d = Drawing()
    d.start(300, 20).line(300, 620)
    d.arc(400, 620, 100, 100, 180, 0)
    d.line(500, 540)
    d.start(140, 472).line(500, 472)
    return make_glyph(d, 30, 34)


def glyph_g():
    d = Drawing()
    d.arc(300, 250, 200, 230, 90, 450)
    d.start(500, 480).line(500, -100)
    d.arc(400, -100, 100, 100, 0, 180)
    d.line(300, -30)
    return make_glyph(d, 30, 30)


def glyph_h():
    d = Drawing()
    d.start(150, 20).line(150, TOP)
    d.arc(330, 300, 180, 200, 180, 0)
    d.line(510, 20)
    return make_glyph(d, 30, 30)


def glyph_i():
    d = Drawing()
    d.start(150, 20).line(150, XTOP)
    d.dot(150, 610)
    return make_glyph(d, 30, 30)


def glyph_j():
    d = Drawing()
    d.start(300, XTOP).line(300, -90)
    d.arc(200, -90, 100, 100, 0, -180)
    d.line(100, 0)
    d.dot(300, 610)
    return make_glyph(d, 26, 26)


def glyph_k():
    d = Drawing()
    d.start(150, 20).line(150, TOP)
    d.start(510, XTOP).line(150, 250)
    d.start(270, 330).line(530, 20)
    return make_glyph(d, 30, 26)


def glyph_l():
    d = Drawing()
    d.start(150, 20).line(150, TOP)
    d.curve((160, 20), (210, 20), (250, 20))
    return make_glyph(d, 30, 34)


def glyph_m():
    d = Drawing()
    d.start(120, 20).line(120, 300)
    d.arc(230, 300, 110, 200, 180, 0)
    d.arc(450, 300, 110, 200, 180, 0)
    d.line(560, 20)
    return make_glyph(d, 26, 26)


def glyph_n():
    d = Drawing()
    d.start(130, 20).line(130, 472)
    d.arc(320, 300, 190, 200, 180, 0)
    d.line(510, 20)
    return make_glyph(d, 26, 26)


def glyph_o():
    d = Drawing()
    d.arc(300, 250, 210, 230, 90, 450)
    return make_glyph(d, 24, 24)


def glyph_p():
    d = Drawing()
    d.start(130, 480).line(130, DESC_TOP)
    d.separate()
    d.arc(330, 250, 200, 230, 90, 450)
    return make_glyph(d, 30, 30)


def glyph_q():
    d = Drawing()
    d.start(530, 480).line(530, DESC_TOP)
    d.separate()
    d.arc(330, 250, 200, 230, 90, 450)
    return make_glyph(d, 34, 34)


def glyph_r():
    d = Drawing()
    d.start(150, 20).line(150, XTOP)
    d.arc(320, 320, 170, 150, 180, 0)
    d.line(490, 250)
    return make_glyph(d, 28, 26)


def glyph_s():
    d = Drawing()
    d.start(500, 430)
    d.curve((480, 490), (400, 510), (310, 498))
    d.curve((200, 484), (155, 430), (180, 370))
    d.curve((205, 310), (280, 292), (360, 270))
    d.curve((440, 248), (475, 205), (455, 140))
    d.curve((430, 55), (300, 10), (170, 60))
    return make_glyph(d, 28, 24)


def glyph_t():
    d = Drawing()
    d.start(260, 690).line(260, 100)
    d.arc(170, 100, 90, 90, 0, 180)
    d.line(80, 200)
    d.start(100, 472).line(480, 472)
    return make_glyph(d, 26, 26)


def glyph_u():
    d = Drawing()
    d.start(140, 472).line(140, 140)
    d.arc(330, 140, 190, 120, 180, 360)
    d.line(520, 472)
    return make_glyph(d, 26, 26)


def glyph_v():
    d = Drawing()
    d.poly([(110, 472), (310, 20), (510, 472)])
    return make_glyph(d, 24, 24)


def glyph_w():
    d = Drawing()
    d.poly([(90, 472), (230, 20), (350, 340), (470, 20), (610, 472)])
    return make_glyph(d, 20, 20)


def glyph_x():
    d = Drawing()
    d.start(120, 472).line(500, 20)
    d.start(500, 472).line(120, 20)
    return make_glyph(d, 26, 26)


def glyph_y():
    d = Drawing()
    d.start(120, 472).line(330, 20)
    d.start(520, 472).line(330, 20).line(250, -170)
    return make_glyph(d, 24, 24)


def glyph_z():
    d = Drawing()
    d.poly([(130, 472), (480, 472), (130, 20), (480, 20)])
    return make_glyph(d, 28, 28)


LOWER = {
    "a": glyph_a, "b": glyph_b, "c": glyph_c, "d": glyph_d, "e": glyph_e,
    "f": glyph_f, "g": glyph_g, "h": glyph_h, "i": glyph_i, "j": glyph_j,
    "k": glyph_k, "l": glyph_l, "m": glyph_m, "n": glyph_n, "o": glyph_o,
    "p": glyph_p, "q": glyph_q, "r": glyph_r, "s": glyph_s, "t": glyph_t,
    "u": glyph_u, "v": glyph_v, "w": glyph_w, "x": glyph_x, "y": glyph_y,
    "z": glyph_z,
}


# ------------------------------------------------------------- punctuation
def glyph_period():
    d = Drawing()
    d.dot(0, 28)
    return make_glyph(d, 44, 44)


def glyph_comma():
    d = Drawing()
    d.dot(20, 46)
    d.curve((16, -18), (0, -58), (-28, -96))
    return make_glyph(d, 40, 40)


def glyph_colon():
    d = Drawing()
    d.dot(0, 28).dot(0, 310)
    return make_glyph(d, 44, 44)


def glyph_semicolon():
    d = Drawing()
    d.dot(20, 310)
    d.dot(20, 46)
    d.curve((16, -18), (0, -58), (-28, -96))
    return make_glyph(d, 40, 40)


def glyph_exclam():
    d = Drawing()
    d.start(0, 250).line(0, TOP)
    d.dot(0, 28)
    return make_glyph(d, 42, 42, 150)


def glyph_question():
    d = Drawing()
    d.start(0, 520)
    d.curve((10, 650), (90, 710), (170, 690))
    d.curve((250, 670), (270, 580), (210, 510))
    d.curve((160, 450), (150, 380), (150, 250))
    d.dot(150, 28)
    return make_glyph(d, 36, 36, 300)


def glyph_hyphen():
    d = Drawing()
    d.start(0, 300).line(190, 300)
    return make_glyph(d, 30, 30, 250)


def glyph_underscore():
    d = Drawing()
    d.start(0, -80).line(430, -80)
    return make_glyph(d, 20, 20, 470)


def glyph_slash():
    d = Drawing()
    d.start(0, 0).line(300, 700)
    return make_glyph(d, 22, 22, 344)


def glyph_backslash():
    d = Drawing()
    d.start(0, 700).line(300, 0)
    return make_glyph(d, 22, 22, 344)


def glyph_parenleft():
    d = Drawing()
    d.start(160, 740)
    d.curve((-20, 560), (-20, 40), (160, -140))
    return make_glyph(d, 46, 46, 240)


def glyph_parenright():
    d = Drawing()
    d.start(40, 740)
    d.curve((220, 560), (220, 40), (40, -140))
    return make_glyph(d, 46, 46, 240)


def glyph_bracketleft():
    d = Drawing()
    d.poly([(210, 740), (60, 740), (60, -140), (210, -140)])
    return make_glyph(d, 40, 40, 270)


def glyph_bracketright():
    d = Drawing()
    d.poly([(30, 740), (180, 740), (180, -140), (30, -140)])
    return make_glyph(d, 40, 40, 270)


def glyph_braceleft():
    d = Drawing()
    d.start(180, 740)
    d.curve((60, 720), (70, 610), (70, 500))
    d.curve((70, 400), (20, 370), (-20, 350))
    d.curve((20, 330), (70, 300), (70, 200))
    d.curve((70, 90), (60, -20), (180, -140))
    return make_glyph(d, 40, 40, 260)


def glyph_braceright():
    d = Drawing()
    d.start(40, 740)
    d.curve((160, 720), (150, 610), (150, 500))
    d.curve((150, 400), (200, 370), (240, 350))
    d.curve((200, 330), (150, 300), (150, 200))
    d.curve((150, 90), (160, -20), (40, -140))
    return make_glyph(d, 40, 40, 260)


def glyph_quotesingle():
    d = Drawing()
    d.start(30, 700).line(0, 590)
    return make_glyph(d, 40, 40, 150)


def glyph_quotedbl():
    d = Drawing()
    d.start(40, 700).line(10, 590)
    d.start(150, 700).line(120, 590)
    return make_glyph(d, 34, 34, 240)


def glyph_quoteleft():
    d = Drawing()
    d.start(30, 590).line(60, 700)
    return make_glyph(d, 40, 40, 150)


def glyph_quoteright():
    return glyph_quotesingle()


def glyph_quotedblleft():
    d = Drawing()
    d.start(40, 590).line(70, 700)
    d.start(150, 590).line(180, 700)
    return make_glyph(d, 34, 34, 240)


def glyph_quotedblright():
    return glyph_quotedbl()


def glyph_asterisk():
    d = Drawing()
    for angle in (90, 150, 210, 270, 330, 30):
        a = math.radians(angle)
        d.start(130 + 100 * math.cos(a), 520 + 100 * math.sin(a))
        d.line(130 - 100 * math.cos(a), 520 - 100 * math.sin(a))
    return make_glyph(d, 36, 36, 340)


def glyph_ampersand():
    d = Drawing()

    def y(value):
        return round((value - 80) * 700 / 610)

    d.start(300, y(620))
    d.curve((160, y(690)), (60, y(600)), (90, y(500)))
    d.curve((120, y(400)), (300, y(390)), (340, y(280)))
    d.curve((380, y(170)), (300, y(80)), (200, y(80)))
    d.curve((90, y(80)), (50, y(180)), (80, y(260)))
    d.curve((120, y(370)), (280, y(390)), (340, y(300)))
    d.line(440, 10)
    return make_glyph(d, 26, 26, 470)


def glyph_at():
    d = Drawing()
    d.arc(340, 350, 290, 290, 40, 320)
    d.separate()
    d.arc(300, 320, 120, 140, 0, 360)
    d.separate()
    d.start(420, 180)
    d.curve((500, 180), (530, 230), (530, 330))
    d.separate()
    d.start(420, 180).line(420, 460)
    return make_glyph(d, 24, 24, 700)


def glyph_numbersign():
    d = Drawing()
    d.start(120, 80).line(200, 620)
    d.start(290, 80).line(370, 620)
    d.start(30, 250).line(420, 250)
    d.start(30, 450).line(420, 450)
    return make_glyph(d, 30, 30, 470)


def glyph_percent():
    d = Drawing()
    d.arc(90, 560, 70, 70, 0, 360)
    d.arc(350, 110, 70, 70, 0, 360)
    d.start(30, 40).line(400, 680)
    return make_glyph(d, 30, 30, 470)


def glyph_dollar():
    d = Drawing()
    d.start(390, 560)
    d.curve((360, 660), (260, 690), (180, 660))
    d.curve((90, 630), (80, 540), (140, 490))
    d.curve((210, 430), (330, 420), (360, 340))
    d.curve((390, 250), (320, 160), (200, 150))
    d.curve((100, 145), (40, 190), (30, 260))
    d.start(210, 40).line(210, 720)
    return make_glyph(d, 30, 30, 450)


def glyph_cent():
    d = Drawing()
    d.arc(330, 350, 230, 330, 42, 318)
    d.start(330, 20).line(330, 700)
    return make_glyph(d, 24, 24, 600)


def glyph_euro():
    d = Drawing()
    d.arc(330, 350, 220, 330, 40, 320)
    d.start(60, 280).line(430, 280)
    d.start(60, 420).line(430, 420)
    return make_glyph(d, 30, 30, 560)


def glyph_pound():
    d = Drawing()
    d.start(120, 28).line(420, 28)
    d.start(160, 28).line(160, 500)
    d.curve((150, 630), (250, 700), (350, 670))
    d.curve((410, 650), (430, 610), (430, 580))
    d.start(60, 330).line(380, 330)
    return make_glyph(d, 26, 26, 500)


def glyph_yen():
    d = Drawing()
    d.start(60, TOP).line(270, 380).line(480, TOP)
    d.start(270, 20).line(270, 380)
    d.start(100, 300).line(440, 300)
    d.start(100, 420).line(440, 420)
    return make_glyph(d, 24, 24, 540)


def glyph_currency():
    d = Drawing()
    d.arc(230, 350, 130, 150, 0, 360)
    d.start(20, 180).line(440, 520)
    d.start(20, 520).line(440, 180)
    return make_glyph(d, 24, 24, 480)


def glyph_brokenbar():
    d = Drawing()
    d.start(0, 180).line(0, 420)
    d.start(0, -60).line(0, 80)
    return make_glyph(d, 42, 42, 120)


def glyph_guillemetleft():
    d = Drawing()
    d.poly([(60, 600), (0, 420), (60, 240)])
    d.poly([(180, 600), (120, 420), (180, 240)])
    return make_glyph(d, 30, 30, 300)


def glyph_guillemetright():
    d = Drawing()
    d.poly([(0, 600), (60, 420), (0, 240)])
    d.poly([(120, 600), (180, 420), (120, 240)])
    return make_glyph(d, 30, 30, 300)


def glyph_not():
    d = Drawing()
    d.start(0, 380).line(300, 380).line(300, 240)
    return make_glyph(d, 30, 30, 360)


def glyph_endash():
    d = Drawing()
    d.start(0, 300).line(440, 300)
    return make_glyph(d, 30, 30, 500)


def glyph_emdash():
    d = Drawing()
    d.start(0, 300).line(940, 300)
    return make_glyph(d, 30, 30, 1000)


def glyph_curlyquoteleft():
    d = Drawing()
    d.start(150, 720)
    d.curve((150, 665), (110, 605), (50, 570))
    return make_glyph(d, 26, 26, 200)


def glyph_curlyquoteright():
    d = Drawing()
    d.start(50, 720)
    d.curve((50, 665), (90, 605), (150, 570))
    return make_glyph(d, 26, 26, 200)


def glyph_curlyquotedblleft():
    d = Drawing()
    for x in (150, 300):
        d.start(x, 720)
        d.curve((x, 665), (x - 40, 605), (x - 100, 570))
    return make_glyph(d, 26, 26, 360)


def glyph_curlyquotedblright():
    d = Drawing()
    for x in (50, 200):
        d.start(x, 720)
        d.curve((x, 665), (x + 40, 605), (x + 100, 570))
    return make_glyph(d, 26, 26, 360)


def glyph_quotesinglbase():
    d = Drawing()
    d.start(110, 240)
    d.curve((105, 205), (80, 170), (40, 140))
    return make_glyph(d, 26, 26, 190)


def glyph_quotedblbase():
    d = Drawing()
    for x in (110, 230):
        d.start(x, 240)
        d.curve((x - 5, 205), (x - 30, 170), (x - 70, 140))
    return make_glyph(d, 26, 26, 300)


def glyph_dagger():
    d = Drawing()
    d.start(0, 720).line(0, 20)
    d.start(-100, 520).line(100, 520)
    return make_glyph(d, 30, 30, 300)


def glyph_daggerdbl():
    d = Drawing()
    d.start(0, 720).line(0, 20)
    d.start(-100, 570).line(100, 570)
    d.start(-100, 340).line(100, 340)
    return make_glyph(d, 30, 30, 300)


def glyph_ellipsis():
    d = Drawing()
    d.dot(0, 28).dot(260, 28).dot(520, 28)
    return make_glyph(d, 34, 34, 620)


def glyph_perthousand():
    d = Drawing()
    d.arc(90, 560, 70, 70, 0, 360)
    d.arc(350, 110, 70, 70, 0, 360)
    d.start(30, 40).line(400, 680)
    d.arc(650, 110, 70, 70, 0, 360)
    return make_glyph(d, 30, 30, 780)


def glyph_guilsinglleft():
    d = Drawing()
    d.poly([(140, 600), (20, 420), (140, 240)])
    return make_glyph(d, 26, 26, 200)


def glyph_guilsinglright():
    d = Drawing()
    d.poly([(20, 600), (140, 420), (20, 240)])
    return make_glyph(d, 26, 26, 200)


def glyph_Euro():
    d = Drawing()
    d.arc(340, 350, 230, 330, 42, 318)
    d.start(60, 430).line(560, 430)
    d.start(60, 250).line(560, 250)
    return make_glyph(d, 26, 26, 680)


def glyph_notequal():
    d = Drawing()
    d.start(0, 430).line(340, 430)
    d.start(0, 250).line(340, 250)
    d.start(40, 120).line(300, 560)
    return make_glyph(d, 30, 30, 400)


def glyph_lessequal():
    d = Drawing()
    d.poly([(300, 560), (0, 380), (300, 200)])
    d.start(0, 110).line(300, 110)
    return make_glyph(d, 20, 20, 360)


def glyph_greaterequal():
    d = Drawing()
    d.poly([(0, 560), (300, 380), (0, 200)])
    d.start(0, 110).line(300, 110)
    return make_glyph(d, 20, 20, 360)


def glyph_minus():
    d = Drawing()
    d.start(0, 300).line(360, 300)
    return make_glyph(d, 30, 30, 420)


def glyph_bar():
    d = Drawing()
    d.start(0, -100).line(0, 700)
    return make_glyph(d, 42, 42, 130)


def glyph_plus():
    d = Drawing()
    d.start(0, 340).line(300, 340)
    d.start(150, 190).line(150, 490)
    return make_glyph(d, 30, 30, 360)


def glyph_equal():
    d = Drawing()
    d.start(0, 260).line(300, 260)
    d.start(0, 430).line(300, 430)
    return make_glyph(d, 30, 30, 360)


def glyph_multiply():
    d = Drawing()
    d.start(20, 200).line(280, 480)
    d.start(20, 480).line(280, 200)
    return make_glyph(d, 30, 30, 360)


def glyph_divide():
    d = Drawing()
    d.start(0, 350).line(300, 350)
    d.dot(150, 180).dot(150, 520)
    return make_glyph(d, 30, 30, 360)


def glyph_less():
    d = Drawing()
    d.poly([(280, 520), (20, 340), (280, 160)])
    return make_glyph(d, 30, 30, 340)


def glyph_greater():
    d = Drawing()
    d.poly([(20, 520), (280, 340), (20, 160)])
    return make_glyph(d, 30, 30, 340)


def glyph_plusminus():
    d = Drawing()
    d.start(0, 300).line(300, 300)
    d.start(150, 150).line(150, 450)
    d.start(0, 100).line(300, 100)
    return make_glyph(d, 30, 30, 360)


def glyph_degree():
    d = Drawing()
    d.arc(90, 580, 80, 80, 0, 360)
    return make_glyph(d, 30, 30, 260)


def glyph_micro():
    d = Drawing()
    d.start(140, 472).line(140, -160)
    d.arc(330, 140, 190, 120, 180, 360)
    d.line(520, 472)
    return make_glyph(d, 26, 26, 620)


def glyph_bullet():
    d = Drawing()
    d.dot(50, 340)
    return make_glyph(d, 40, 40, 200)


def glyph_middot():
    d = Drawing()
    d.dot(0, 340)
    return make_glyph(d, 44, 44, 130)


def glyph_copyright():
    d = Drawing()
    d.arc(310, 350, 300, 320, 0, 360)
    d.separate()
    d.arc(310, 350, 130, 150, 50, 310)
    return make_glyph(d, 24, 24, 660)


def glyph_registered():
    d = Drawing()
    d.arc(310, 350, 300, 320, 0, 360)
    d.poly([(230, 210), (230, 490), (350, 490)])
    d.arc(350, 420, 70, 70, 90, -90)
    d.line(230, 350)
    d.start(350, 350).line(420, 210)
    return make_glyph(d, 24, 24, 660)


def glyph_trademark():
    d = Drawing()
    d.start(20, 620).line(250, 620)
    d.start(135, 620).line(135, 380)
    d.poly([(320, 380), (320, 620), (420, 470), (520, 620), (520, 380)])
    return make_glyph(d, 24, 24, 600)


def glyph_section():
    d = Drawing()
    d.start(430, 620)
    d.curve((430, 700), (330, 735), (240, 715))
    d.curve((140, 692), (90, 630), (110, 570))
    d.curve((128, 515), (210, 490), (290, 452))
    d.curve((350, 424), (380, 396), (382, 368))
    d.separate()
    d.start(250, 392)
    d.curve((180, 372), (120, 330), (108, 280))
    d.curve((92, 205), (150, 140), (240, 122))
    d.curve((330, 104), (410, 135), (428, 190))
    return make_glyph(d, 30, 24, 540)


def glyph_paragraph():
    d = Drawing()
    d.start(150, 20).line(150, 672)
    d.start(320, 20).line(320, 672)
    d.poly([(150, 672), (420, 672)])
    d.arc(420, 560, 110, 112, 90, -90)
    d.line(150, 448)
    return make_glyph(d, 30, 30, 470)


def glyph_asciicircum():
    d = Drawing()
    d.poly([(0, 300), (150, 600), (300, 300)])
    return make_glyph(d, 30, 30, 340)


def glyph_grave():
    d = Drawing()
    d.start(0, 700).line(130, 590)
    return make_glyph(d, 30, 30, 180)


def glyph_asciitilde():
    d = Drawing()
    d.start(0, 340)
    d.curve((60, 450), (120, 450), (170, 360))
    d.curve((220, 270), (280, 270), (330, 380))
    return make_glyph(d, 26, 26, 380)


# --------------------------------------------------------------- numerals
def glyph_zero():
    d = Drawing()
    d.arc(300, 350, 210, 322, 90, 450)
    return make_glyph(d, 24, 24, 620)


def glyph_one():
    d = Drawing()
    d.start(280, BASE).line(280, TOP)
    d.start(170, 560).line(280, TOP)
    return make_glyph(d, 30, 30, 620)


def glyph_two():
    d = Drawing()
    d.arc(320, 520, 210, 190, 200, -20)
    d.line(110, BASE)
    d.line(570, BASE)
    return make_glyph(d, 22, 30, 620)


def glyph_three():
    d = Drawing()
    d.start(130, 600)
    d.curve((180, 700), (400, 730), (480, 650))
    d.curve((550, 580), (520, 470), (430, 430))
    d.curve((560, 400), (590, 270), (510, 180))
    d.curve((430, 90), (200, 70), (130, 170))
    return make_glyph(d, 28, 26, 620)


def glyph_four():
    d = Drawing()
    d.poly([(460, TOP), (80, 250), (540, 250)])
    d.start(460, BASE).line(460, TOP)
    return make_glyph(d, 22, 32, 620)


def glyph_five():
    d = Drawing()
    d.poly([(540, TOP), (150, TOP), (150, 380), (330, 380)])
    d.arc(330, 200, 200, 180, 90, -90)
    d.curve((300, 20), (240, 24), (190, 70))
    return make_glyph(d, 26, 26, 620)


def glyph_six():
    d = Drawing()
    d.start(470, 640)
    d.curve((390, 715), (185, 625), (167, 365))
    d.arc(320, 230, 200, 210, 140, 500)
    return make_glyph(d, 26, 26, 620)


def glyph_seven():
    d = Drawing()
    d.poly([(120, TOP), (560, TOP), (280, BASE)])
    return make_glyph(d, 26, 26, 620)


def glyph_eight():
    d = Drawing()
    d.start(310, 350)
    d.curve((450, 330), (500, 500), (430, 600))
    d.curve((360, 700), (200, 690), (150, 590))
    d.curve((90, 490), (180, 380), (310, 350))
    d.curve((440, 320), (500, 180), (430, 90))
    d.curve((360, 10), (200, 20), (150, 110))
    d.curve((90, 210), (180, 320), (310, 350))
    return make_glyph(d, 26, 26, 620)


def glyph_nine():
    d = Drawing()
    d.start(150, 60)
    d.curve((230, -15), (450, 75), (453, 335))
    d.arc(300, 470, 200, 210, -40, 320)
    return make_glyph(d, 26, 26, 620)


DIGITS = {
    "0": glyph_zero, "1": glyph_one, "2": glyph_two, "3": glyph_three,
    "4": glyph_four, "5": glyph_five, "6": glyph_six, "7": glyph_seven,
    "8": glyph_eight, "9": glyph_nine,
}


UPPER = {
    "A": glyph_A, "B": glyph_B, "C": glyph_C, "D": glyph_D, "E": glyph_E,
    "F": glyph_F, "G": glyph_G, "H": glyph_H, "I": glyph_I, "J": glyph_J,
    "K": glyph_K, "L": glyph_L, "M": glyph_M, "N": glyph_N, "O": glyph_O,
    "P": glyph_P, "Q": glyph_Q, "R": glyph_R, "S": glyph_S, "T": glyph_T,
    "U": glyph_U, "V": glyph_V, "W": glyph_W, "X": glyph_X, "Y": glyph_Y,
    "Z": glyph_Z,
}


def glyph_notdef():
    d = Drawing(42)
    d.poly([(60, 10), (60, 690), (440, 690), (440, 10), (60, 10)])
    d.start(60, 10).line(440, 690)
    d.start(440, 10).line(60, 690)
    return make_glyph(d, 40, 40, 520)


def glyph_zeroslash():
    d = Drawing()
    d.arc(300, 350, 210, 322, 90, 450)
    d.start(120, 90).line(480, 610)
    return make_glyph(d, 24, 24, 620)


PUNCT = {
    "!": glyph_exclam, '"': glyph_quotedbl, "#": glyph_numbersign,
    "$": glyph_dollar, "%": glyph_percent, "&": glyph_ampersand,
    "'": glyph_quotesingle, "(": glyph_parenleft, ")": glyph_parenright,
    "*": glyph_asterisk, "+": glyph_plus, ",": glyph_comma,
    "-": glyph_hyphen, ".": glyph_period, "/": glyph_slash,
    ":": glyph_colon, ";": glyph_semicolon, "<": glyph_less,
    "=": glyph_equal, ">": glyph_greater, "?": glyph_question,
    "@": glyph_at, "[": glyph_bracketleft, "\\": glyph_backslash,
    "]": glyph_bracketright, "^": glyph_asciicircum, "_": glyph_underscore,
    "`": glyph_grave, "{": glyph_braceleft, "|": glyph_bar,
    "}": glyph_braceright, "~": glyph_asciitilde,
}
PUNCT_NAMES = {
    "!": "exclam", '"': "quotedbl", "#": "numbersign", "$": "dollar",
    "%": "percent", "&": "ampersand", "'": "quotesingle",
    "(": "parenleft", ")": "parenright", "*": "asterisk", "+": "plus",
    ",": "comma", "-": "hyphen", ".": "period", "/": "slash",
    ":": "colon", ";": "semicolon", "<": "less", "=": "equal",
    ">": "greater", "?": "question", "@": "at", "[": "bracketleft",
    "\\": "backslash", "]": "bracketright", "^": "asciicircum",
    "_": "underscore", "`": "grave", "{": "braceleft", "|": "bar",
    "}": "braceright", "~": "asciitilde",
}
DIGIT_NAMES = dict(zip("0123456789", (
    "zero", "one", "two", "three", "four", "five", "six", "seven",
    "eight", "nine",
)))


def glyph_name(char):
    return DIGIT_NAMES.get(char) or PUNCT_NAMES.get(char) or char


def glyph_dcroat():
    d = Drawing()
    d.arc(330, 250, 200, 230, 90, 450)
    d.start(530, 20).line(530, TOP)
    d.start(80, 490).line(620, 490)
    return make_glyph(d, 34, 34, 680)


def glyph_Lmiddot():
    d = Drawing()
    d.poly([(150, TOP), (150, BASE), (600, BASE)])
    d.dot(300, 350)
    return make_glyph(d, 40, 40, 680)


def glyph_lmiddot():
    d = Drawing()
    d.start(150, 20).line(150, TOP)
    d.curve((160, 20), (210, 20), (250, 20))
    d.dot(150, 350)
    return make_glyph(d, 30, 34, 340)


def glyph_napostrophe():
    d = Drawing()
    d.start(130, 20).line(130, 472)
    d.arc(320, 300, 190, 200, 180, 0)
    d.line(510, 20)
    d.start(540, 690).line(510, 590)
    return make_glyph(d, 26, 26, 680)


def glyph_dotlessj():
    d = Drawing()
    d.start(300, XTOP).line(300, -90)
    d.arc(200, -90, 100, 100, 0, -180)
    d.line(100, 0)
    return make_glyph(d, 26, 26, 400)


def glyph_dotlessi():
    d = Drawing()
    d.start(150, 20).line(150, XTOP)
    return make_glyph(d, 30, 30)


def glyph_AE():
    d = Drawing()
    d.poly([(40, 20), (230, 672), (410, 672), (410, 20)])
    d.start(230, 672).line(410, 20)
    d.poly([(410, 20), (700, 20)])
    d.start(410, 672).line(700, 672)
    d.start(410, 350).line(660, 350)
    d.start(150, 350).line(410, 350)
    return make_glyph(d, 24, 32, 760)


def glyph_ae():
    d = Drawing()
    d.arc(210, 250, 180, 230, 90, 450)
    d.start(390, 20).line(390, 480)
    d.separate()
    d.arc(560, 250, 160, 230, 0, 300)
    d.start(390, 250).line(720, 250)
    return make_glyph(d, 24, 28, 780)


def glyph_OE():
    d = Drawing()
    d.arc(280, 350, 230, 330, 90, 450)
    d.poly([(520, 20), (520, 672), (820, 672)])
    d.start(520, 20).line(820, 20)
    d.start(520, 350).line(780, 350)
    return make_glyph(d, 24, 30, 890)


def glyph_oe():
    d = Drawing()
    d.arc(250, 250, 210, 230, 90, 450)
    d.start(460, 20).line(460, 480)
    d.separate()
    d.arc(620, 250, 160, 230, 0, 300)
    d.start(460, 250).line(780, 250)
    return make_glyph(d, 24, 26, 860)


def glyph_Oslash():
    d = Drawing()
    d.arc(320, 350, 230, 330, 90, 450)
    d.start(20, 20).line(620, 680)
    return make_glyph(d, 24, 24, 690)


def glyph_oslash():
    d = Drawing()
    d.arc(300, 250, 210, 230, 90, 450)
    d.start(50, 20).line(550, 480)
    return make_glyph(d, 24, 24, 650)


def glyph_Eth():
    d = Drawing()
    d.poly([(150, 20), (150, 672), (320, 672)])
    d.arc(320, 350, 230, 322, 90, -90)
    d.line(150, 20)
    d.start(20, 350).line(420, 350)
    return make_glyph(d, 40, 26, 650)


def glyph_eth():
    d = Drawing()
    d.arc(300, 250, 200, 230, 90, 450)
    d.start(500, 20).line(500, 500)
    d.line(620, 600)
    d.start(250, 350).line(500, 350)
    return make_glyph(d, 30, 30, 660)


def glyph_Thorn():
    d = Drawing()
    d.start(150, 20).line(150, 672)
    d.start(150, 540).line(340, 540)
    d.arc(340, 440, 170, 100, 90, -90)
    d.line(150, 340)
    return make_glyph(d, 40, 36, 640)


def glyph_thorn():
    d = Drawing()
    d.start(130, -180).line(130, 700)
    d.separate()
    d.arc(330, 250, 200, 230, 90, 450)
    return make_glyph(d, 30, 30, 660)


def glyph_Esharp():
    d = Drawing()
    d.start(140, 20).line(140, 700)
    d.curve((140, 780), (300, 780), (370, 700))
    d.curve((440, 620), (420, 530), (330, 500))
    d.curve((290, 488), (250, 496), (230, 510))
    d.start(350, 500)
    d.curve((480, 480), (520, 380), (500, 290))
    d.curve((480, 170), (370, 100), (270, 90))
    d.curve((340, 40), (420, 20), (460, 20))
    return make_glyph(d, 28, 28, 640)


def glyph_germandbls():
    d = Drawing()
    # The stem rises above the bowl, like a long s, which keeps this out of B territory.
    d.start(140, 20).line(140, 744)
    d.separate()
    d.start(140, 560)
    d.curve((140, 660), (240, 715), (330, 695))
    d.curve((410, 678), (435, 590), (400, 530))
    d.curve((372, 480), (300, 458), (250, 470))
    # The lower bowl opens on the left and finishes in a short tail.
    d.separate()
    d.start(330, 520)
    d.curve((450, 492), (482, 390), (470, 300))
    d.curve((458, 180), (360, 100), (260, 90))
    d.curve((330, 50), (390, 30), (420, 30))
    return make_glyph(d, 28, 28, 580)


def glyph_exclamdown():
    d = Drawing()
    d.start(0, 450).line(0, 28)
    d.dot(0, 672)
    return make_glyph(d, 42, 42, 150)


def glyph_questiondown():
    d = Drawing()
    d.start(280, 230)
    d.curve((270, 100), (190, 40), (110, 60))
    d.curve((30, 80), (10, 170), (70, 240))
    d.curve((120, 300), (130, 370), (130, 500))
    d.dot(130, 672)
    return make_glyph(d, 36, 36, 300)


def glyph_Lslash():
    d = Drawing()
    d.poly([(150, 672), (150, 20), (600, 20)])
    d.start(50, 250).line(300, 430)
    return make_glyph(d, 26, 30, 650)


def glyph_lslash():
    d = Drawing()
    d.start(150, 20).line(150, 672)
    d.curve((160, 20), (210, 20), (250, 20))
    d.start(50, 220).line(260, 380)
    return make_glyph(d, 30, 32, 340)


def glyph_Hbar():
    d = Drawing()
    d.start(150, 20).line(150, 672)
    d.start(570, 20).line(570, 672)
    d.start(150, 350).line(570, 350)
    d.start(80, 430).line(640, 430)
    return make_glyph(d, 34, 34, 720)


def glyph_hbar():
    d = Drawing()
    d.start(150, 20).line(150, 672)
    d.arc(330, 300, 180, 200, 180, 0)
    d.line(510, 20)
    d.start(80, 420).line(580, 420)
    return make_glyph(d, 30, 30, 660)


def glyph_Tbar():
    d = Drawing()
    d.start(70, 672).line(610, 672)
    d.start(340, 20).line(340, 672)
    d.start(120, 400).line(560, 400)
    return make_glyph(d, 32, 34, 680)


def glyph_tbar():
    d = Drawing()
    d.start(260, 690).line(260, 100)
    d.arc(170, 100, 90, 90, 0, 180)
    d.line(80, 200)
    d.start(100, 472).line(480, 472)
    d.start(120, 560).line(420, 560)
    return make_glyph(d, 26, 26, 500)


def glyph_Eng():
    d = Drawing()
    d.poly([(150, 20), (150, 672), (610, 20), (610, 672)])
    d.line(610, -120)
    d.arc(500, -120, 110, 100, 0, -180)
    d.line(390, -40)
    return make_glyph(d, 34, 34, 750)


def glyph_eng():
    d = Drawing()
    d.start(130, 20).line(130, 472)
    d.arc(320, 300, 190, 200, 180, 0)
    d.line(510, 20)
    d.line(510, -100)
    d.arc(400, -100, 110, 90, 0, -180)
    d.line(290, -30)
    return make_glyph(d, 26, 26, 660)


def glyph_longs():
    d = Drawing()
    d.start(300, 20).line(300, 620)
    d.arc(400, 620, 100, 100, 180, 0)
    d.line(500, 540)
    return make_glyph(d, 30, 34, 520)


def glyph_kra():
    return glyph_k()


SPECIALS = {
    "Æ": glyph_AE, "æ": glyph_ae, "Œ": glyph_OE, "œ": glyph_oe,
    "Ø": glyph_Oslash, "ø": glyph_oslash, "Ð": glyph_Eth, "ð": glyph_eth,
    "Þ": glyph_Thorn, "þ": glyph_thorn, "ß": glyph_germandbls,
    "¡": glyph_exclamdown, "¿": glyph_questiondown,
    "Ł": glyph_Lslash, "ł": glyph_lslash,
    "Ħ": glyph_Hbar, "ħ": glyph_hbar, "Ŧ": glyph_Tbar, "ŧ": glyph_tbar,
    "Ŋ": glyph_Eng, "ŋ": glyph_eng, "ſ": glyph_longs, "ĸ": glyph_kra,
    "ı": glyph_dotlessi, "¢": glyph_cent, "£": glyph_pound,
    "¤": glyph_currency, "¥": glyph_yen, "©": glyph_copyright,
    "®": glyph_registered, "™": glyph_trademark, "§": glyph_section,
    "¶": glyph_paragraph, "°": glyph_degree, "±": glyph_plusminus,
    "µ": glyph_micro, "·": glyph_middot, "×": glyph_multiply,
    "÷": glyph_divide, "¦": glyph_brokenbar, "«": glyph_guillemetleft,
    "»": glyph_guillemetright, "¬": glyph_not,
    "ẞ": glyph_Esharp,
    "Đ": glyph_Eth, "đ": glyph_dcroat, "Ŀ": glyph_Lmiddot,
    "ŀ": glyph_lmiddot, "ŉ": glyph_napostrophe,
    "\u2010": glyph_hyphen, "\u2011": glyph_hyphen,
    "\u2013": glyph_endash, "\u2014": glyph_emdash,
    "\u2018": glyph_curlyquoteleft, "\u2019": glyph_curlyquoteright,
    "\u201a": glyph_quotesinglbase, "\u201c": glyph_curlyquotedblleft,
    "\u201d": glyph_curlyquotedblright, "\u201e": glyph_quotedblbase,
    "\u2020": glyph_dagger, "\u2021": glyph_daggerdbl,
    "\u2022": glyph_bullet, "\u2026": glyph_ellipsis,
    "\u2030": glyph_perthousand, "\u2039": glyph_guilsinglleft,
    "\u203a": glyph_guilsinglright, "\u2044": glyph_slash,
    "\u20ac": glyph_Euro, "\u2212": glyph_minus,
    "\u2260": glyph_notequal, "\u2264": glyph_lessequal,
    "\u2265": glyph_greaterequal,
}

# ------------------------------------------------------------------- marks
def mark_acute():
    d = Drawing(44)
    d.start(-52, 0).line(48, 100)
    return make_glyph(d, 20, 20, 190)


def mark_grave():
    d = Drawing(44)
    d.start(52, 0).line(-48, 100)
    return make_glyph(d, 20, 20, 190)


def mark_circumflex():
    d = Drawing(44)
    d.poly([(-64, 0), (0, 88), (64, 0)])
    return make_glyph(d, 20, 20, 210)


def mark_tilde():
    d = Drawing(44)
    d.start(-72, 35)
    d.curve((-30, 105), (30, -25), (72, 45))
    return make_glyph(d, 18, 18, 210)


def mark_dieresis():
    d = Drawing(44)
    d.dot(-46, 52).dot(46, 52)
    return make_glyph(d, 20, 20, 180)


def mark_ring():
    d = Drawing(44)
    d.arc(0, 55, 38, 38, 0, 360)
    return make_glyph(d, 20, 20, 180)


def mark_macron():
    d = Drawing(44)
    d.start(-62, 52).line(62, 52)
    return make_glyph(d, 20, 20, 200)


def mark_breve():
    d = Drawing(44)
    d.arc(0, 74, 60, 44, 180, 360)
    return make_glyph(d, 20, 20, 200)


def mark_caron():
    d = Drawing(44)
    d.poly([(-62, 88), (0, 0), (62, 88)])
    return make_glyph(d, 20, 20, 200)


def mark_cedilla():
    d = Drawing(44)
    d.start(0, 0)
    d.curve((0, -55), (-38, -70), (-40, -105))
    return make_glyph(d, 24, 24, 150)


def mark_ogonek():
    d = Drawing(44)
    d.start(34, 0)
    d.curve((30, -45), (52, -75), (28, -102))
    d.line(-6, -88)
    return make_glyph(d, 24, 24, 150)


def mark_dotabove():
    d = Drawing(44)
    d.dot(0, 55)
    return make_glyph(d, 24, 24, 100)


def mark_doubleacute():
    d = Drawing(44)
    d.start(-70, 0).line(-24, 96)
    d.start(24, 0).line(70, 96)
    return make_glyph(d, 16, 16, 210)


MARKS = {
    "acute": mark_acute, "grave": mark_grave, "circumflex": mark_circumflex,
    "tilde": mark_tilde, "dieresis": mark_dieresis, "ring": mark_ring,
    "macron": mark_macron, "breve": mark_breve, "caron": mark_caron,
    "cedilla": mark_cedilla, "ogonek": mark_ogonek,
    "dotabove": mark_dotabove, "doubleacute": mark_doubleacute,
}

# char: (base, mark, below/attached, horizontal placement factor)
ACCENTS = {
    "À": ("A", "grave", "above", .5), "Á": ("A", "acute", "above", .5),
    "Â": ("A", "circumflex", "above", .5), "Ã": ("A", "tilde", "above", .5),
    "Ä": ("A", "dieresis", "above", .5), "Å": ("A", "ring", "above", .5),
    "Ç": ("C", "cedilla", "below", .5),
    "È": ("E", "grave", "above", .5), "É": ("E", "acute", "above", .5),
    "Ê": ("E", "circumflex", "above", .5), "Ë": ("E", "dieresis", "above", .5),
    "Ì": ("I", "grave", "above", .5), "Í": ("I", "acute", "above", .5),
    "Î": ("I", "circumflex", "above", .5), "Ï": ("I", "dieresis", "above", .5),
    "Ñ": ("N", "tilde", "above", .5),
    "Ò": ("O", "grave", "above", .5), "Ó": ("O", "acute", "above", .5),
    "Ô": ("O", "circumflex", "above", .5), "Õ": ("O", "tilde", "above", .5),
    "Ö": ("O", "dieresis", "above", .5),
    "Ù": ("U", "grave", "above", .5), "Ú": ("U", "acute", "above", .5),
    "Û": ("U", "circumflex", "above", .5), "Ü": ("U", "dieresis", "above", .5),
    "Ý": ("Y", "acute", "above", .5),
    "à": ("a", "grave", "above", .5), "á": ("a", "acute", "above", .5),
    "â": ("a", "circumflex", "above", .5), "ã": ("a", "tilde", "above", .5),
    "ä": ("a", "dieresis", "above", .5), "å": ("a", "ring", "above", .5),
    "ç": ("c", "cedilla", "below", .5),
    "è": ("e", "grave", "above", .5), "é": ("e", "acute", "above", .5),
    "ê": ("e", "circumflex", "above", .5), "ë": ("e", "dieresis", "above", .5),
    "ì": ("i", "grave", "above", .5), "í": ("i", "acute", "above", .5),
    "î": ("i", "circumflex", "above", .5), "ï": ("i", "dieresis", "above", .5),
    "ñ": ("n", "tilde", "above", .5),
    "ò": ("o", "grave", "above", .5), "ó": ("o", "acute", "above", .5),
    "ô": ("o", "circumflex", "above", .5), "õ": ("o", "tilde", "above", .5),
    "ö": ("o", "dieresis", "above", .5),
    "ù": ("u", "grave", "above", .5), "ú": ("u", "acute", "above", .5),
    "û": ("u", "circumflex", "above", .5), "ü": ("u", "dieresis", "above", .5),
    "ý": ("y", "acute", "above", .5), "ÿ": ("y", "dieresis", "above", .5),
}

EXTENDED_ACCENTS = {
    "Ā": ("A", "macron"), "ā": ("a", "macron"),
    "Ă": ("A", "breve"), "ă": ("a", "breve"),
    "Ą": ("A", "ogonek"), "ą": ("a", "ogonek"),
    "Ć": ("C", "acute"), "ć": ("c", "acute"),
    "Ĉ": ("C", "circumflex"), "ĉ": ("c", "circumflex"),
    "Ċ": ("C", "dotabove"), "ċ": ("c", "dotabove"),
    "Č": ("C", "caron"), "č": ("c", "caron"),
    "Ď": ("D", "caron"), "ď": ("d", "caron"),
    "Ē": ("E", "macron"), "ē": ("e", "macron"),
    "Ĕ": ("E", "breve"), "ĕ": ("e", "breve"),
    "Ė": ("E", "dotabove"), "ė": ("e", "dotabove"),
    "Ę": ("E", "ogonek"), "ę": ("e", "ogonek"),
    "Ě": ("E", "caron"), "ě": ("e", "caron"),
    "Ĝ": ("G", "circumflex"), "ĝ": ("g", "circumflex"),
    "Ğ": ("G", "breve"), "ğ": ("g", "breve"),
    "Ġ": ("G", "dotabove"), "ġ": ("g", "dotabove"),
    "Ģ": ("G", "cedilla"), "ģ": ("g", "cedilla"),
    "Ĥ": ("H", "circumflex"), "ĥ": ("h", "circumflex"),
    "Ĵ": ("J", "circumflex"), "ĵ": ("j", "circumflex"),
    "Ķ": ("K", "cedilla"), "ķ": ("k", "cedilla"),
    "Ĩ": ("I", "tilde"), "ĩ": ("i", "tilde"),
    "Ī": ("I", "macron"), "ī": ("i", "macron"),
    "Ĭ": ("I", "breve"), "ĭ": ("i", "breve"),
    "Į": ("I", "ogonek"), "į": ("i", "ogonek"),
    "İ": ("I", "dotabove"),
    "Ĺ": ("L", "acute"), "ĺ": ("l", "acute"),
    "Ļ": ("L", "cedilla"), "ļ": ("l", "cedilla"),
    "Ľ": ("L", "caron"), "ľ": ("l", "caron"),
    "Ń": ("N", "acute"), "ń": ("n", "acute"),
    "Ņ": ("N", "cedilla"), "ņ": ("n", "cedilla"),
    "Ň": ("N", "caron"), "ň": ("n", "caron"),
    "Ō": ("O", "macron"), "ō": ("o", "macron"),
    "Ŏ": ("O", "breve"), "ŏ": ("o", "breve"),
    "Ő": ("O", "doubleacute"), "ő": ("o", "doubleacute"),
    "Ŕ": ("R", "acute"), "ŕ": ("r", "acute"),
    "Ŗ": ("R", "cedilla"), "ŗ": ("r", "cedilla"),
    "Ř": ("R", "caron"), "ř": ("r", "caron"),
    "Ś": ("S", "acute"), "ś": ("s", "acute"),
    "Ŝ": ("S", "circumflex"), "ŝ": ("s", "circumflex"),
    "Ş": ("S", "cedilla"), "ş": ("s", "cedilla"),
    "Š": ("S", "caron"), "š": ("s", "caron"),
    "Ţ": ("T", "cedilla"), "ţ": ("t", "cedilla"),
    "Ť": ("T", "caron"), "ť": ("t", "caron"),
    "Ũ": ("U", "tilde"), "ũ": ("u", "tilde"),
    "Ū": ("U", "macron"), "ū": ("u", "macron"),
    "Ŭ": ("U", "breve"), "ŭ": ("u", "breve"),
    "Ů": ("U", "ring"), "ů": ("u", "ring"),
    "Ű": ("U", "doubleacute"), "ű": ("u", "doubleacute"),
    "Ų": ("U", "ogonek"), "ų": ("u", "ogonek"),
    "Ŵ": ("W", "circumflex"), "ŵ": ("w", "circumflex"),
    "Ŷ": ("Y", "circumflex"), "ŷ": ("y", "circumflex"),
    "Ÿ": ("Y", "dieresis"), "Ź": ("Z", "acute"), "ź": ("z", "acute"),
    "Ż": ("Z", "dotabove"), "ż": ("z", "dotabove"),
    "Ž": ("Z", "caron"), "ž": ("z", "caron"),
}

def build():
    notdef, notdef_advance = glyph_notdef()
    glyphs = {".notdef": notdef, "space": TTGlyphPen(None).glyph()}
    metrics = {".notdef": (notdef_advance, 0), "space": (260, 0)}
    cmap = {32: "space"}
    order = [".notdef", "space"]
    for characters in (UPPER, LOWER, DIGITS, PUNCT):
        for char, function in characters.items():
            name = glyph_name(char)
            glyph, advance = function()
            glyphs[name] = glyph
            metrics[name] = (advance, 0)
            cmap[ord(char)] = name
            order.append(name)
    for char, function in SPECIALS.items():
        name = AGL_NAMES.get(ord(char), f"uni{ord(char):04X}")
        glyph, advance = function()
        glyphs[name] = glyph
        metrics[name] = (advance, 0)
        cmap[ord(char)] = name
        order.append(name)
    glyph, advance = glyph_dotlessj()
    glyphs["dotlessj"] = glyph
    metrics["dotlessj"] = (advance, 0)
    order.append("dotlessj")
    for mark_name, function in MARKS.items():
        name = f"{mark_name}comb"
        glyph, advance = function()
        glyphs[name] = glyph
        metrics[name] = (0, 0)
        order.append(name)
    # Accented composites keep the base outline and place a mark above or below.
    for table, extended in ((ACCENTS, False), (EXTENDED_ACCENTS, True)):
        for char, data in table.items():
            if extended:
                base, mark = data
                placement = "above"
                position = .5
            else:
                base, mark, placement, position = data
            base_name = base
            if base == "i" and placement == "above":
                base_name = "dotlessi"
            if base == "j" and placement == "above" and mark != "cedilla":
                base_name = "dotlessj"
            if base_name not in metrics:
                continue
            advance = metrics[base_name][0]
            upper = base.isupper()
            dy = 736 if placement == "above" and upper else (
                536 if placement == "above" else 0
            )
            if base.lower() in ("d", "l", "t") and placement == "above":
                dy = 736
            if mark == "ogonek":
                position = .68
            dx = advance * position
            pen = TTGlyphPen(glyphs)
            pen.addComponent(base_name, (1, 0, 0, 1, 0, 0))
            pen.addComponent(f"{mark}comb", (1, 0, 0, 1, dx, dy))
            name = AGL_NAMES.get(ord(char), f"uni{ord(char):04X}")
            glyphs[name] = pen.glyph()
            metrics[name] = (advance, 0)
            cmap[ord(char)] = name
            order.append(name)
    # IJ ligatures sit between their two drawn letters.
    for char, first, second in (("Ĳ", "I", "J"), ("ĳ", "i", "j")):
        name = AGL_NAMES[ord(char)]
        advance = metrics[first][0] + metrics[second][0]
        pen = TTGlyphPen(glyphs)
        pen.addComponent(first, (1, 0, 0, 1, 0, 0))
        pen.addComponent(second, (1, 0, 0, 1, metrics[first][0], 0))
        glyphs[name] = pen.glyph()
        metrics[name] = (advance, 0)
        cmap[ord(char)] = name
        order.append(name)
    # Raised small forms and fractions reuse the drawn base glyphs.
    def add_composite(char, components, advance):
        name = AGL_NAMES.get(ord(char), f"uni{ord(char):04X}")
        pen = TTGlyphPen(glyphs)
        for base, transform in components:
            pen.addComponent(base, transform)
        glyphs[name] = pen.glyph()
        metrics[name] = (advance, 0)
        cmap[ord(char)] = name
        order.append(name)

    for char, base in (("ª", "a"), ("º", "o")):
        add_composite(char, [(base, (.55, 0, 0, .55, 0, 310))], 300)
    for char, base in (("¹", "one"), ("²", "two"), ("³", "three")):
        add_composite(char, [(base, (.5, 0, 0, .5, 20, 330))], 300)
    for char, numerator, denominator in (
        ("¼", "one", "four"), ("½", "one", "two"), ("¾", "three", "four"),
    ):
        add_composite(
            char,
            [
                (numerator, (.4, 0, 0, .4, 0, 390)),
                ("slash", (.55, 0, 0, .55, 140, 80)),
                (denominator, (.4, 0, 0, .4, 280, 0)),
            ],
            560,
        )
    # Spacing accent characters, raised from the combining marks.
    spacing = {"¨": ("dieresiscomb", .5), "¯": ("macroncomb", 52),
               "´": ("acutecomb", 0), "¸": ("cedillacomb", 0)}
    for char, (mark, dy) in spacing.items():
        name = AGL_NAMES.get(ord(char), f"uni{ord(char):04X}")
        pen = TTGlyphPen(glyphs)
        pen.addComponent(mark, (1, 0, 0, 1, 100, 420 + dy))
        glyphs[name] = pen.glyph()
        metrics[name] = (200, 0)
        cmap[ord(char)] = name
        order.append(name)
    # Non-breaking space and soft hyphen.
    cmap[0x00A0] = "space"
    soft = TTGlyphPen(None).glyph()
    glyphs["softhyphen"] = soft
    metrics["softhyphen"] = (120, 0)
    cmap[0x00AD] = "softhyphen"
    order.append("softhyphen")
    zeroslash, zeroslash_advance = glyph_zeroslash()
    glyphs["zero.slash"] = zeroslash
    metrics["zero.slash"] = (zeroslash_advance, 0)
    order.append("zero.slash")
    font = FontBuilder(UPM, isTTF=True)
    font.setupGlyphOrder(order)
    font.setupCharacterMap(cmap)
    font.setupGlyf(glyphs)
    font.setupHorizontalMetrics(metrics)
    font.setupHead(fontRevision=2.0, lowestRecPPEM=8, flags=3)
    font.font["head"].created = FONT_EPOCH
    font.font["head"].modified = FONT_EPOCH
    font.setupHorizontalHeader(
        ascent=ASCENDER, descent=DESCENDER, lineGap=0,
        caretSlopeRise=1, caretSlopeRun=0, caretOffset=0,
    )
    font.setupNameTable({
        "familyName": "REEO Circuit Display",
        "styleName": "Regular",
        "uniqueFontIdentifier": "REEO-Circuit-Display-2.000",
        "fullName": "REEO Circuit Display Regular",
        "psName": "REEOCircuitDisplay-Regular",
        "version": "Version 2.000",
        "copyright": "Original REEO Circuit Display typeface. Licensed under GPL-3.0-only; see the repository LICENSE.",
        "designer": "Abdou-da0wew",
        "designerURL": "https://github.com/abdou-da0wew/REEO",
        "manufacturer": "REEO",
        "vendorURL": "https://github.com/abdou-da0wew/REEO",
        "licenseDescription": "GNU General Public License v3.0 only. See the repository LICENSE.",
        "licenseInfoURL": "https://www.gnu.org/licenses/gpl-3.0.html",
        "sampleText": "REEO — Digital logic, limitless curiosity.",
    })
    font.setupOS2(
        version=4, usWeightClass=400, usWidthClass=5, fsType=0,
        fsSelection=0x40, achVendID="REEO",
        sTypoAscender=ASCENDER, sTypoDescender=DESCENDER, sTypoLineGap=0,
        usWinAscent=950, usWinDescent=320,
        sxHeight=XHEIGHT, sCapHeight=CAP,
        usDefaultChar=0, usBreakChar=32, usMaxContext=2,
        ulCodePageRange1=0x3,
    )
    font.setupPost(
        formatType=2.0, italicAngle=0, underlinePosition=-110,
        underlineThickness=54, isFixedPitch=0,
    )
    pairs = [
        ("A", "V", -74), ("A", "W", -60), ("A", "Y", -78), ("A", "T", -54),
        ("A", "C", -26), ("A", "G", -24), ("A", "O", -30), ("A", "Q", -30),
        ("A", "U", -24), ("A", "v", -50), ("A", "w", -40), ("A", "y", -54),
        ("F", "A", -38), ("F", "a", -30), ("F", "e", -26), ("F", "o", -24),
        ("L", "T", -62), ("L", "V", -68), ("L", "W", -58), ("L", "Y", -72),
        ("O", "A", -26), ("O", "V", -20), ("O", "W", -18), ("O", "Y", -24),
        ("O", "T", -18),
        ("P", "A", -46), ("P", "a", -28), ("P", "e", -22), ("P", "o", -22),
        ("P", ",", -40), ("P", ".", -46),
        ("R", "A", -18), ("R", "V", -18), ("R", "W", -16), ("R", "Y", -20),
        ("T", "A", -54), ("T", "C", -24), ("T", "G", -24), ("T", "O", -30),
        ("T", "S", -24), ("T", "a", -44), ("T", "e", -36), ("T", "i", -24),
        ("T", "o", -36), ("T", "r", -30), ("T", "s", -30), ("T", "u", -28),
        ("T", "y", -26), ("T", ".", -50), ("T", ",", -46),
        ("V", "A", -62), ("V", "a", -44), ("V", "e", -36), ("V", "i", -26),
        ("V", "o", -38), ("V", "r", -30), ("V", "u", -28), ("V", "y", -28),
        ("V", ".", -46), ("V", ",", -42),
        ("W", "A", -54), ("W", "a", -40), ("W", "e", -32), ("W", "i", -22),
        ("W", "o", -34), ("W", "r", -28), ("W", "u", -26), ("W", "y", -26),
        ("W", ".", -42), ("W", ",", -38),
        ("Y", "A", -66), ("Y", "a", -46), ("Y", "e", -38), ("Y", "i", -26),
        ("Y", "o", -40), ("Y", "r", -32), ("Y", "u", -30), ("Y", "y", -30),
        ("Y", ".", -48), ("Y", ",", -44),
        ("D", "A", -20), ("D", "V", -18), ("D", "W", -16), ("D", "Y", -20),
        ("K", "O", -20), ("K", "V", -24), ("K", "W", -22), ("K", "Y", -26),
        ("K", "e", -22), ("K", "o", -22),
        ("X", "O", -16), ("X", "a", -16), ("X", "e", -16), ("X", "o", -16),
        ("Z", "A", -14), ("Z", "O", -12), ("Z", "V", -12), ("Z", "Y", -16),
        ("a", "v", -32), ("a", "w", -24), ("a", "y", -36),
        ("b", "o", -14), ("b", "e", -12), ("c", "a", -16), ("c", "o", -14),
        ("e", "a", -16), ("e", "o", -10), ("e", "v", -24), ("e", "w", -20),
        ("e", "y", -30), ("f", "a", -20), ("f", "e", -16), ("f", "o", -16),
        ("f", ".", -30), ("g", "a", -16), ("g", "e", -14), ("g", "o", -14),
        ("g", "r", -10), ("k", "a", -18), ("k", "e", -16), ("k", "o", -16),
        ("k", "v", -26), ("k", "w", -22), ("k", "y", -28),
        ("l", "a", -12), ("l", "e", -10), ("l", "o", -10),
        ("o", "a", -14), ("o", "e", -8), ("o", "o", -6), ("o", "v", -24),
        ("o", "w", -20), ("o", "y", -30), ("p", "a", -16), ("p", "e", -12),
        ("p", "o", -12), ("p", ".", -30), ("r", "a", -14), ("r", "e", -12),
        ("r", "o", -10), ("r", ".", -30), ("s", "a", -14), ("s", "e", -12),
        ("s", "o", -12), ("s", "p", -10), ("t", "a", -18), ("t", "e", -16),
        ("t", "o", -16), ("t", "y", -12), ("v", "a", -32), ("v", "e", -26),
        ("v", "o", -28), ("v", ".", -36), ("w", "a", -28), ("w", "e", -24),
        ("w", "o", -24), ("w", ".", -34), ("y", "a", -34), ("y", "e", -28),
        ("y", "o", -30), ("y", ".", -38),
    ]
    lookup = {char: glyph_name(char) for char in PUNCT}
    def font_name(char):
        return lookup.get(char) or AGL_NAMES.get(ord(char), char)
    kern = "\n".join(
        f"  pos {font_name(left)} {font_name(right)} {value};"
        for left, right, value in pairs
        if font_name(left) in glyphs and font_name(right) in glyphs
    )
    features = f"""feature kern {{
{kern}
}} kern;
feature ss01 {{
  sub zero by zero.slash;
}} ss01;
"""
    addOpenTypeFeatures(font.font, io.StringIO(features))
    font.save(OUT / "REEOCircuitDisplay.ttf")
    print("wrote", OUT / "REEOCircuitDisplay.ttf", "glyphs:", len(order))


if __name__ == "__main__":
    build()
