# fonts

This folder contains material symbols woff2, dictionary and used hex codes.

We are using `Material Symbols (new)`
from [https://fonts.google.com/icons](https://fonts.google.com/icons)

## how to add an icon?

1. locate material icons interface `UiIconType`
   in [ui-icon.type.ts](../../libs/ui/src/lib/ui/types/ui-icon.type.ts)
2. add required icon(s) to interface
3. run update script

## running normal update

this will only update minimized woff2 files and used icons

> `./docker/scripts/material-icons.sh`

## running full update

this will download and update required woff2 file and dictionary

> `./docker/scripts/material-icons.sh update`

## commit changes

> `git add . && git commit`

## check font file

visit [https://fontdrop.info](https://fontdrop.info) and upload generated woff2
file
`material-symbols-outlined.min.woff2` in [fonts](../fonts)
