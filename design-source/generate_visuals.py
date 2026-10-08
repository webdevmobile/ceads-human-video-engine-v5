from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math, random

ROOT = Path(__file__).resolve().parents[1]
OUT_T = ROOT / 'assets/visuals/thumbnails'
OUT_M = ROOT / 'assets/visuals/modules'
OUT_B = ROOT / 'assets/visuals/bonus'
for p in [OUT_T, OUT_M, OUT_B]: p.mkdir(parents=True, exist_ok=True)

COL = {
    'bg':'#08111F','surface':'#0B1426','surface2':'#101C33','blue':'#175CFF','orange':'#FF5A24','cyan':'#28C7FA','green':'#4ADE80','white':'#FFFFFF','muted':'#9FB0C9','line':'#21304A'
}
FONT_REG='/usr/share/fonts/opentype/inter/Inter-Regular.otf'
FONT_MED='/usr/share/fonts/opentype/inter/Inter-Medium.otf'
FONT_SEMI='/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
FONT_BOLD='/usr/share/fonts/opentype/inter/Inter-Bold.otf'
FONT_XB='/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'

def font(size, weight='reg'):
    path={'reg':FONT_REG,'med':FONT_MED,'semi':FONT_SEMI,'bold':FONT_BOLD,'xb':FONT_XB}[weight]
    return ImageFont.truetype(path, size)

def hexrgb(h):
    h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))

def mix(a,b,t): return tuple(round(a[i]*(1-t)+b[i]*t) for i in range(3))

def linear_gradient(size, c1, c2, horizontal=False):
    w,h=size
    base = Image.linear_gradient("L")
    if horizontal:
        base = base.rotate(90, expand=True)
    base = base.resize((w,h))
    return Image.merge("RGB", tuple(Image.eval(base, lambda v, i=i: int(hexrgb(c1)[i] + (hexrgb(c2)[i]-hexrgb(c1)[i])*(v/255))) for i in range(3)))

def add_glow(im, center, radius, color, alpha=100):
    layer=Image.new('RGBA', im.size, (0,0,0,0)); d=ImageDraw.Draw(layer)
    x,y=center; d.ellipse([x-radius,y-radius,x+radius,y+radius], fill=hexrgb(color)+(alpha,))
    layer=layer.filter(ImageFilter.GaussianBlur(radius//2))
    im.alpha_composite(layer)

def add_grid(im, spacing=56, alpha=18):
    d=ImageDraw.Draw(im)
    w,h=im.size
    for x in range(0,w,spacing): d.line((x,0,x,h), fill=(255,255,255,alpha), width=1)
    for y in range(0,h,spacing): d.line((0,y,w,y), fill=(255,255,255,alpha), width=1)

def rr(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def text_box(draw, xy, text, f, fill, max_width=None, spacing=6, anchor=None):
    if not max_width:
        draw.text(xy,text,font=f,fill=fill,anchor=anchor); return
    words=text.split(); lines=[]; cur=''
    for word in words:
        test=(cur+' '+word).strip()
        if draw.textbbox((0,0),test,font=f)[2] <= max_width: cur=test
        else:
            if cur: lines.append(cur)
            cur=word
    if cur: lines.append(cur)
    x,y=xy
    for line in lines:
        draw.text((x,y),line,font=f,fill=fill,anchor=anchor)
        y += f.size + spacing
    return y

def person(draw, cx, cy, scale=1.0, skin='#6B402C', shirt='#175CFF', hair='#16100D', pose='talk', gender='f'):
    s=scale
    # torso
    torso_w=int(190*s); torso_h=int(210*s)
    rr(draw,(cx-torso_w//2,cy+50*s,cx+torso_w//2,cy+50*s+torso_h),int(54*s),hexrgb(shirt)+(255,))
    # neck
    rr(draw,(cx-27*s,cy+23*s,cx+27*s,cy+84*s),int(16*s),hexrgb(skin)+(255,))
    # head
    draw.ellipse((cx-74*s,cy-105*s,cx+74*s,cy+56*s),fill=hexrgb(skin)+(255,))
    # ears
    draw.ellipse((cx-82*s,cy-30*s,cx-62*s,cy+6*s),fill=hexrgb(skin)+(255,))
    draw.ellipse((cx+62*s,cy-30*s,cx+82*s,cy+6*s),fill=hexrgb(skin)+(255,))
    # hair
    if gender=='f':
        draw.pieslice((cx-86*s,cy-126*s,cx+86*s,cy+30*s),180,360,fill=hexrgb(hair)+(255,))
        draw.ellipse((cx-96*s,cy-110*s,cx-42*s,cy+38*s),fill=hexrgb(hair)+(255,))
    else:
        draw.pieslice((cx-78*s,cy-122*s,cx+78*s,cy+4*s),180,360,fill=hexrgb(hair)+(255,))
    # eyes
    eye_y=cy-24*s
    for ex in (cx-28*s,cx+28*s):
        draw.ellipse((ex-7*s,eye_y-5*s,ex+7*s,eye_y+5*s),fill=(20,18,18,255))
        draw.ellipse((ex-2*s,eye_y-2*s,ex+2*s,eye_y+2*s),fill=(255,255,255,210))
    # brows
    draw.line((cx-41*s,cy-43*s,cx-17*s,cy-47*s),fill=(35,25,20,255),width=max(1,int(4*s)))
    draw.line((cx+17*s,cy-47*s,cx+41*s,cy-43*s),fill=(35,25,20,255),width=max(1,int(4*s)))
    # nose/mouth
    draw.line((cx,cy-20*s,cx-3*s,cy+5*s),fill=(105,58,42,255),width=max(1,int(3*s)))
    mouth_y=cy+24*s
    draw.arc((cx-24*s,mouth_y-8*s,cx+24*s,mouth_y+12*s),0,180,fill=(74,25,22,255),width=max(2,int(4*s)))
    # arm/gesture
    arm=hexrgb(skin)+(255,)
    if pose=='talk':
        draw.rounded_rectangle((cx+68*s,cy+95*s,cx+98*s,cy+225*s),radius=int(14*s),fill=arm)
        draw.ellipse((cx+78*s,cy+65*s,cx+112*s,cy+105*s),fill=arm)
    elif pose=='phone':
        draw.rounded_rectangle((cx+65*s,cy+95*s,cx+95*s,cy+190*s),radius=int(14*s),fill=arm)
        rr(draw,(cx+78*s,cy+45*s,cx+122*s,cy+135*s),int(9*s),(18,26,43,255),outline=(90,110,140,255),width=max(1,int(2*s)))
    elif pose=='point':
        draw.line((cx+60*s,cy+110*s,cx+160*s,cy+30*s),fill=arm,width=max(10,int(24*s)))
        draw.ellipse((cx+150*s,cy+20*s,cx+180*s,cy+50*s),fill=arm)


def header_chip(draw, label, x, y, color='#28C7FA'):
    f=font(24,'semi'); bbox=draw.textbbox((0,0),label,font=f); w=bbox[2]-bbox[0]
    rr(draw,(x,y,x+w+44,y+48),24,hexrgb('#0C1A2D')+(230,),outline=hexrgb(color)+(110,),width=2)
    draw.ellipse((x+14,y+17,x+26,y+29),fill=hexrgb(color)+(255,))
    draw.text((x+34,y+12),label,font=f,fill=hexrgb(color)+(255,))

def draw_phone(draw, x,y,w,h,accent='#175CFF'):
    rr(draw,(x,y,x+w,y+h),int(w*.12),(10,14,24,255),outline=(85,103,132,255),width=max(2,int(w*.015)))
    rr(draw,(x+w*.08,y+h*.08,x+w*.92,y+h*.92),int(w*.08),hexrgb('#101C33')+(255,))
    draw.rounded_rectangle((x+w*.35,y+h*.03,x+w*.65,y+h*.065),radius=10,fill=(40,48,62,255))
    draw.ellipse((x+w*.42,y+h*.82,x+w*.58,y+h*.90),fill=hexrgb(accent)+(200,))

def thumb_base(size, accent='#175CFF'):
    im=linear_gradient(size,COL['bg'],COL['surface2']).convert('RGBA')
    add_glow(im,(int(size[0]*.16),int(size[1]*.2)),int(min(size)*.28),accent,95)
    add_glow(im,(int(size[0]*.86),int(size[1]*.82)),int(min(size)*.22),COL['orange'],55)
    add_grid(im, max(42,size[0]//24), 13)
    return im

def save_thumb(filename, size, title, subtitle, scene='ugc', accent='#175CFF', chip='CEADS · HUMAN VIDEO ENGINE'):
    im=thumb_base(size,accent); d=ImageDraw.Draw(im)
    w,h=size
    # dark title zone
    d.rectangle((0,int(h*.58),w,h),fill=(6,14,26,190))
    header_chip(d,chip,int(w*.055),int(h*.055),accent)

    # scene illustrations
    if scene=='hero':
        person(d,int(w*.72),int(h*.38),1.55 if w>1200 else .9,skin='#74452E',shirt=COL['blue'],pose='talk',gender='f')
        draw_phone(d,int(w*.52),int(h*.22),int(w*.13),int(h*.42),COL['orange'])
        rr(d,(int(w*.79),int(h*.17),int(w*.94),int(h*.46)),26,hexrgb('#101C33')+(230,),outline=hexrgb('#28C7FA')+(100,),width=2)
        for i,c in enumerate([COL['cyan'],COL['orange'],COL['green']]):
            d.rounded_rectangle((int(w*.81),int(h*(.21+i*.07)),int(w*.92),int(h*(.245+i*.07))),radius=10,fill=hexrgb(c)+(90,))
    elif scene=='vsl':
        person(d,int(w*.72),int(h*.36),1.6 if w>1200 else .95,skin='#6A3D2C',shirt='#172B56',pose='point',gender='m')
        rr(d,(int(w*.49),int(h*.16),int(w*.64),int(h*.44)),30,hexrgb('#0C1A2D')+(235,),outline=hexrgb(accent)+(90,),width=2)
        d.polygon([(int(w*.545),int(h*.25)),(int(w*.545),int(h*.35)),(int(w*.595),int(h*.30))],fill=hexrgb('#FFFFFF')+(240,))
    elif scene=='generic':
        person(d,int(w*.73),int(h*.36),1.55 if w>1200 else .9,skin='#8A573C',shirt='#435166',pose='talk',gender='f')
        # robotic guides
        for x in [int(w*.56),int(w*.82)]: d.line((x,int(h*.13),x,int(h*.55)),fill=(110,130,160,85),width=2)
        d.rectangle((int(w*.61),int(h*.18),int(w*.87),int(h*.52)),outline=(160,180,210,80),width=3)
    elif scene=='directed':
        person(d,int(w*.72),int(h*.38),1.55 if w>1200 else .9,skin='#70442F',shirt=COL['orange'],pose='phone',gender='f')
        for p in [(int(w*.60),int(h*.20)),(int(w*.88),int(h*.29)),(int(w*.65),int(h*.48))]:
            d.ellipse((p[0]-10,p[1]-10,p[0]+10,p[1]+10),fill=hexrgb(COL['cyan'])+(210,))
    elif scene=='coaching':
        # grid of video participants
        sx=int(w*.49); sy=int(h*.13); cellw=int(w*.19); cellh=int(h*.18)
        skins=['#6C402F','#8C5D40','#5A3628','#9C6847']
        for idx in range(4):
            cx=sx+(idx%2)*(cellw+18); cy=sy+(idx//2)*(cellh+18)
            rr(d,(cx,cy,cx+cellw,cy+cellh),22,hexrgb('#101C33')+(245,),outline=(70,90,120,130),width=2)
            person(d,cx+cellw//2,cy+int(cellh*.54),.42,skin=skins[idx],shirt=[COL['blue'],COL['orange'],COL['cyan'],'#4A5370'][idx],gender='f' if idx%2==0 else 'm')
    elif scene=='ugc':
        person(d,int(w*.72),int(h*.38),1.45 if h<1200 else 1.2,skin='#75472F',shirt=COL['orange'],pose='phone',gender='f')
        rr(d,(int(w*.49),int(h*.18),int(w*.61),int(h*.32)),20,hexrgb('#101C33')+(220,),outline=hexrgb(COL['cyan'])+(80,),width=2)
        d.text((int(w*.515),int(h*.22)),'REC',font=font(max(20,int(w*.025)),'bold'),fill=hexrgb(COL['orange'])+(255,))
    elif scene=='face':
        person(d,int(w*.72),int(h*.40),1.45 if h<1200 else 1.18,skin='#603928',shirt=COL['blue'],pose='talk',gender='m')
        d.ellipse((int(w*.51),int(h*.12),int(w*.64),int(h*.32)),outline=hexrgb(COL['cyan'])+(125,),width=max(3,int(w*.005)))
        d.rectangle((int(w*.56),int(h*.31),int(w*.575),int(h*.48)),fill=(100,115,135,180))
    elif scene=='story':
        person(d,int(w*.73),int(h*.39),1.35 if h<1200 else 1.15,skin='#8A563D',shirt='#4E2F78',pose='talk',gender='f')
        for i in range(3):
            x=int(w*(.48+i*.11)); y=int(h*(.16+i*.055))
            rr(d,(x,y,x+int(w*.10),y+int(h*.12)),18,hexrgb('#101C33')+(220,),outline=hexrgb([COL['cyan'],COL['orange'],COL['blue']][i])+(80,),width=2)
    elif scene=='voice':
        person(d,int(w*.76),int(h*.39),1.28 if h<1200 else 1.1,skin='#74472E',shirt='#283A56',pose='talk',gender='m')
        # waveform
        base=int(h*.34)
        for i in range(18):
            x=int(w*.47)+i*int(w*.018); amp=(1+math.sin(i*.8))*int(h*.035)+8
            d.rounded_rectangle((x,base-amp,x+6,base+amp),radius=3,fill=hexrgb(COL['cyan'])+(210,))
    elif scene=='product':
        person(d,int(w*.72),int(h*.40),1.18,skin='#865338',shirt=COL['orange'],pose='talk',gender='f')
        rr(d,(int(w*.47),int(h*.21),int(w*.60),int(h*.47)),24,(241,235,225,255),outline=hexrgb(COL['orange'])+(120,),width=3)
        d.text((int(w*.492),int(h*.29)),'PROD',font=font(max(20,int(w*.026)),'bold'),fill=hexrgb(COL['surface'])+(255,))
    elif scene=='service':
        person(d,int(w*.70),int(h*.41),1.14,skin='#6B402D',shirt=COL['blue'],pose='talk',gender='m')
        # laptop
        rr(d,(int(w*.47),int(h*.33),int(w*.63),int(h*.48)),14,(25,35,52,255),outline=(90,110,140,160),width=2)
        d.polygon([(int(w*.45),int(h*.49)),(int(w*.65),int(h*.49)),(int(w*.61),int(h*.53)),(int(w*.49),int(h*.53))],fill=(50,65,90,255))
    elif scene=='reel':
        draw_phone(d,int(w*.56),int(h*.10),int(w*.27),int(h*.48),COL['cyan'])
        person(d,int(w*.695),int(h*.37),.73,skin='#7C4C34',shirt=COL['orange'],pose='talk',gender='f')
    elif scene=='edu':
        person(d,int(w*.73),int(h*.41),1.13,skin='#744631',shirt=COL['blue'],pose='point',gender='m')
        rr(d,(int(w*.46),int(h*.15),int(w*.63),int(h*.39)),16,(20,35,58,255),outline=hexrgb(COL['cyan'])+(90,),width=2)
        d.line((int(w*.49),int(h*.22),int(w*.60),int(h*.22)),fill=hexrgb(COL['cyan'])+(180,),width=4)
        d.line((int(w*.49),int(h*.28),int(w*.57),int(h*.28)),fill=hexrgb(COL['orange'])+(180,),width=4)

    # title
    title_f=font(max(38,int(w*.042)),'xb')
    sub_f=font(max(18,int(w*.018)),'med')
    x=int(w*.055); y=int(h*.655)
    y2=text_box(d,(x,y),title,title_f,hexrgb(COL['white'])+(255,),max_width=int(w*.66),spacing=int(title_f.size*.08))
    text_box(d,(x,y2+8),subtitle,sub_f,hexrgb(COL['muted'])+(255,),max_width=int(w*.72),spacing=4)
    # accent line
    d.rounded_rectangle((x,int(h*.62),x+int(w*.09),int(h*.627)),radius=4,fill=hexrgb(accent)+(255,))
    im.convert('RGB').save(OUT_T/filename, quality=93)


def mockup_base(size, title, subtitle, kind='course', accent='#175CFF', label='MODULE'):
    im=thumb_base(size, accent); d=ImageDraw.Draw(im); w,h=size
    header_chip(d,label,int(w*.06),int(h*.06),accent)
    # desk shadow
    d.ellipse((int(w*.18),int(h*.68),int(w*.88),int(h*.88)),fill=(0,0,0,70))
    # central mockup screen/book
    if kind=='laptop':
        rr(d,(int(w*.20),int(h*.20),int(w*.78),int(h*.62)),30,(18,29,49,255),outline=(86,105,140,180),width=3)
        rr(d,(int(w*.235),int(h*.245),int(w*.745),int(h*.575)),18,hexrgb('#0B1426')+(255,))
        d.polygon([(int(w*.15),int(h*.64)),(int(w*.83),int(h*.64)),(int(w*.76),int(h*.70)),(int(w*.22),int(h*.70))],fill=(58,72,95,255))
    elif kind=='book':
        rr(d,(int(w*.28),int(h*.16),int(w*.70),int(h*.70)),24,hexrgb('#101C33')+(255,),outline=hexrgb(accent)+(120,),width=3)
        d.polygon([(int(w*.70),int(h*.16)),(int(w*.78),int(h*.22)),(int(w*.78),int(h*.72)),(int(w*.70),int(h*.70))],fill=hexrgb('#0A1628')+(255,))
    elif kind=='cards':
        for i,off in enumerate([(0,0),(32,26),(64,52)]):
            x=int(w*.22)+off[0]; y=int(h*.20)+off[1]
            rr(d,(x,y,x+int(w*.50),y+int(h*.44)),26,hexrgb('#101C33')+(250,),outline=hexrgb([accent,COL['cyan'],COL['orange']][i])+(85,),width=2)
    elif kind=='phone':
        draw_phone(d,int(w*.34),int(h*.15),int(w*.30),int(h*.55),accent)
    else:
        rr(d,(int(w*.24),int(h*.18),int(w*.74),int(h*.66)),28,hexrgb('#101C33')+(255,),outline=hexrgb(accent)+(110,),width=3)
    # abstract internal UI
    for i in range(4):
        x=int(w*.31); y=int(h*(.28+i*.075)); ww=int(w*(.30 + (.09 if i==0 else 0)))
        d.rounded_rectangle((x,y,x+ww,y+int(h*.022)),radius=8,fill=hexrgb([COL['cyan'],COL['white'],COL['muted'],accent][i])+(120 if i else 200,))
    # title area lower
    d.rectangle((0,int(h*.72),w,h),fill=(7,14,25,205))
    tf=font(max(30,int(w*.037)),'xb'); sf=font(max(17,int(w*.017)),'med')
    x=int(w*.06); y=int(h*.755)
    y=text_box(d,(x,y),title,tf,hexrgb(COL['white'])+(255,),max_width=int(w*.88),spacing=3)
    text_box(d,(x,y+5),subtitle,sf,hexrgb(COL['muted'])+(255,),max_width=int(w*.86),spacing=3)
    return im

thumbs = [
 ('hero-video.jpg',(1600,900),'DES VIDÉOS IA QUI PARAISSENT HUMAINES','De la stratégie au rendu final','hero',COL['blue']),
 ('vsl.jpg',(1600,900),'NE GÉNÈRE PLUS. DIRIGE.','Le système pour transformer ton offre en vidéo crédible','vsl',COL['orange']),
 ('generic-video.jpg',(1600,900),'LE RÉSULTAT GÉNÉRIQUE','Quand l’IA récite au lieu de jouer','generic','#64748B'),
 ('directed-video.jpg',(1600,900),'LE RÉSULTAT DIRIGÉ','Regard, gestes, pauses et timing pensés scène par scène','directed',COL['cyan']),
 ('coaching-video.jpg',(1600,900),'ON CORRIGE TES VIDÉOS AVEC TOI','Sessions live + feedback précis','coaching',COL['green']),
 ('format-ugc.jpg',(1080,1350),'UGC IA','Un personnage naturel qui parle à la cible','ugc',COL['orange']),
 ('format-facecam.jpg',(1080,1350),'FACE CAMÉRA','Une présence claire, crédible et humaine','face',COL['blue']),
 ('format-storytelling.jpg',(1080,1350),'STORYTELLING','Une histoire, une progression, une émotion','story',COL['orange']),
 ('format-voiceover.jpg',(1080,1350),'VOICE-OVER + B-ROLLS','Une narration cohérente illustrée par les bonnes scènes','voice',COL['cyan']),
 ('format-product.jpg',(1080,1080),'PRODUIT PHYSIQUE','Montre l’usage, le bénéfice et le contexte','product',COL['orange']),
 ('format-service.jpg',(1080,1080),'SERVICE','Rends une offre abstraite concrète','service',COL['blue']),
 ('format-reel.jpg',(1080,1080),'REEL / SHORT','Accroche vite. Montre. Coupe. Relance.','reel',COL['cyan']),
 ('format-edu.jpg',(1080,1080),'CONTENU ÉDUCATIF','Explique clairement et renforce ton autorité','edu',COL['blue']),
]
for args in thumbs: save_thumb(*args)

modules=[
 ('module-01.jpg','INSTALLER TON SYSTÈME','Une stack claire pour démarrer sans te perdre','laptop',COL['blue']),
 ('module-02.jpg','CHATGPT · CERVEAU MARKETING','Comprendre le marché avant d’écrire','laptop',COL['cyan']),
 ('module-03.jpg','ANGLES · HOOKS · SCRIPTS','Transformer les insights en messages qui captent','cards',COL['orange']),
 ('module-04.jpg','PINTEREST · PERSONNAGE','Trouver la bonne référence visuelle','phone',COL['orange']),
 ('module-05.jpg','HUMAN REALISM','Rendre le personnage plus humain, seconde après seconde','book',COL['cyan']),
 ('module-06.jpg','SCRIPT → SCENE MAP','Passer d’un texte à une direction de scène','cards',COL['blue']),
 ('module-07.jpg','GOOGLE FLOW','Créer UGC, scènes parlantes et B-rolls','laptop',COL['blue']),
 ('module-08.jpg','VOICE-OVER & STORYTELLING','Une seule voix, une narration cohérente','phone',COL['cyan']),
 ('module-09.jpg','CAPCUT · MONTAGE','Assembler, rythmer et finaliser','laptop',COL['orange']),
 ('module-10.jpg','QUALITY CONTROL','Corriger, standardiser et reproduire','cards',COL['green']),
]
for fn,t,st,k,a in modules:
    mockup_base((1200,900),t,st,k,a,'MODULE').convert('RGB').save(OUT_M/fn,quality=93)

bonuses=[
 ('bonus-01.jpg','HUMAN REALISM PLAYBOOK™','Checklist de direction humaine','book',COL['cyan']),
 ('bonus-02.jpg','AI VIDEO RESCUE KIT™','Réparer une scène ratée sans tout recommencer','cards',COL['orange']),
 ('bonus-03.jpg','100 HOOKS & ANGLES','Des points de départ pour trouver vite le bon message','cards',COL['orange']),
 ('bonus-04.jpg','SCENE BUILDER PRO','Des canevas pour structurer chaque plan','laptop',COL['blue']),
 ('bonus-05.jpg','B-ROLL STORYTELLING LIBRARY','Savoir quoi montrer pendant une narration','book',COL['cyan']),
 ('bonus-06.jpg','AFRICAN LOCALIZATION KIT','Adapter personnages, décors et contexte au marché','phone',COL['orange']),
 ('bonus-07.jpg','30 CREATIVE BRIEFS','Des cas prêts à adapter à ton offre','cards',COL['blue']),
 ('bonus-08.jpg','CAPCUT FAST EDITING','Des structures de montage pour aller plus vite','laptop',COL['orange']),
 ('bonus-09.jpg','AI VIDEO PROMPT VAULT','Une bibliothèque de prompts à personnaliser','book',COL['cyan']),
 ('bonus-10.jpg','TOOL UPDATES','Rester à jour quand les outils évoluent','laptop',COL['green']),
]
for fn,t,st,k,a in bonuses:
    mockup_base((1200,900),t,st,k,a,'BONUS').convert('RGB').save(OUT_B/fn,quality=93)

print('Generated', len(thumbs), 'thumbnails,', len(modules), 'module mockups,', len(bonuses), 'bonus mockups')
