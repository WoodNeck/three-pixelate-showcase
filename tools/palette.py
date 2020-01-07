# https://github.com/KevinVDVelden/BunchOfTests/blob/master/palettebuilder.py
import sys
import math
import json
import os
from PIL import Image

os.chdir(os.path.dirname(__file__)) # Move to current file path

def parse_color(color):
	if color[0] == "#":
		color = color[1:]
	if len(color) == 3:
		color = "".join([color[0], color[0], color[1], color[1], color[2], color[2]])

	r = int(color[0:2], 16)
	g = int(color[2:4], 16)
	b = int(color[4:6], 16)
	return (r, g, b)

with open("colors.json", "r") as f:
	colors = json.load(f);
	colors = [parse_color(col) for col in colors]

print("Using following colors")
print(colors)

def diff(col, r, g, b):
	r = col[0] - ( r * 16 )
	g = col[1] - ( g * 16 )
	b = col[2] - ( b * 16 )

	return math.sqrt( r * r + g * g + b * b )

out = Image.new("RGB", ( 64, 64 ))

def mapping( r, g, b ):
	i = r + ( g * 16 ) + ( b * 16 * 16 )

	ret = ( int( i / 64 ), i % 64 )
	return ret

for b in range( 16 ):
	for g in range( 16 ):
		for r in range( 16 ):
			closestI = 0
			closest = diff( colors[0], r, g, b )

			for i in range( 1, len( colors ) ):
				_diff = diff( colors[i], r, g, b )
				if _diff < closest:
					closest = _diff
					closestI = i

			xy = mapping( r, g, b )
			out.putpixel( xy, colors[closestI] )

file_name = "palette.png"
out.save(file_name)
print("Created palette with name {}".format(file_name))
