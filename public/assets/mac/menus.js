// The menus of Finder and Preview, macOS 27.2 in English, as drawn in his recording of 2026-11-28 09:07
// (rec3/menus-spec.md; built by tools/menus_build.py, do not edit by hand). «Title|shortcut|flags|icon»: flags o dimmed,
// s submenu, c checked, h section header; icon an SF Symbol in a/menu/ or app:/file: a colour icon. «---» a separator.
window.MAC_MENUS = {
"Finder": [
[
"Finder",
[
"About Finder||",
"---",
"Settings…|⌘,||icon:gear",
"---",
"Empty Trash…|⇧⌘⌫|o",
"---",
"Services||s",
"---",
"Hide Finder|⌘H|",
"Hide Others|⌥⌘H|",
"Show All||o"
]
],
[
"File",
[
"New Finder Window|⌘N|",
"New Folder|⇧⌘N|",
"New Folder with Selection|⌃⌘N|o",
"New Smart Folder||",
"New Tab|⌘T|",
"Open|⌘O|o",
"Open With||os",
"Close Window|⌘W|o",
"---",
"Get Info|⌘I|",
"Rename||o",
"Compress||o",
"Duplicate|⌘D|o",
"Make Alias|⌃⌘A|o",
"Quick Look|⌘Y|o",
"---",
"Share…||o|icon:square.and.arrow.up",
"Manage Shared File…||o|icon:person.2",
"---",
"Show Original|⌘R|o",
"Add to Sidebar|⌃⌘T|o",
"---",
"Move to Trash|⌘⌫|o|icon:trash",
"Eject|⌘E|o|icon:eject",
"---",
"[tag colour dots row: red, orange, yellow, green, blue, purple, gray] (dimmed)",
"Tags…||o|icon:tag",
"---",
"Print|⌘P|o|icon:printer"
]
],
[
"Edit",
[
"Undo|⌘Z|o",
"Redo|⇧⌘Z|o",
"---",
"Cut|⌘X|o",
"Copy|⌘C|o",
"Paste Item|⌘V|",
"Select All|⌘A|",
"---",
"Show Clipboard||",
"---",
"Search|⌘F||icon:magnifyingglass@13-small-semibold",
"---",
"Writing Tools||s",
"---",
"AutoFill||s|icon:rectangle.and.pencil.and.ellipsis",
"Start Dictation…|🎤||icon:mic",
"Emoji & Symbols|🌐||icon:emoji.face.grinning"
]
],
[
"View",
[
"as Icons|⌘1|co|icon:square.grid.2x2",
"as List|⌘2|o|icon:list.bullet",
"as Columns|⌘3|o|icon:rectangle.split.3x1",
"as Gallery|⌘4|o|icon:squares.below.rectangle",
"---",
"Use Stacks|⌃⌘0|",
"Sort By||s",
"Clean Up||",
"Clean Up By||s",
"---",
"Show Tab Bar|⇧⌘T|o",
"Show All Tabs|⇧⌘\\|o",
"---",
"Hide Sidebar|⌃⌘S|o",
"Show Preview|⇧⌘P|o",
"---",
"Hide Toolbar|⌥⌘T|o",
"Show Path Bar|⌥⌘P|o",
"Show Status Bar|⌘/|o",
"---",
"Customize Toolbar…||o",
"---",
"Show View Options|⌘J|",
"Show Preview Options||o",
"---",
"Enter Full Screen|🌐F|o"
]
],
[
"Go",
[
"Back|⌘[|o",
"Forward|⌘]|o",
"Enclosing Folder|⌘▲|",
"---",
"Recents|⇧⌘F||icon:clock",
"Documents|⇧⌘O||icon:doc",
"Desktop|⇧⌘D||icon:menubar.dock.rectangle",
"Downloads|⌥⌘L||icon:arrow.down.circle",
"Home|⇧⌘H||icon:house",
"Computer|⇧⌘C||icon:laptopcomputer",
"AirDrop|⇧⌘R||icon:airdrop",
"Network|⇧⌘K||icon:network",
"iCloud Drive|⇧⌘I||icon:icloud",
"Shared|⇧⌘S||icon:person.2",
"Applications|⇧⌘A||icon:appstore",
"Utilities|⇧⌘U||icon:wrench.and.screwdriver",
"---",
"Recent Folders||s",
"---",
"Go to Folder…|⇧⌘G|",
"Connect to Server…|⌘K|"
]
],
[
"Window",
[
"Minimize||o",
"Zoom||o",
"Fill||o",
"Center|⌃⌥Space|o",
"---",
"Move & Resize||s|icon:inset.filled.righthalf.arrowtriangle.right.rectangle",
"Full Screen Tile||os|icon:rectangle.split.2x1",
"---",
"Bring All to Front||",
"Cycle Through Windows|⌘`|",
"Remove Window from Set||o",
"---",
"Show Previous Tab|⌃⇧⇥|o",
"Show Next Tab|⌃⇥|o",
"Move Tab to New Window||o",
"Merge All Windows||o",
"---",
"Show Progress Window||o"
]
],
[
"Help",
[
"[search field]",
"Mac User Guide|||icon:book.pages",
"Tips for Your Mac|||icon:tips"
]
]
],
"Preview": [
[
"Preview",
[
"About Preview||",
"---",
"Settings…|⌘,||icon:gear",
"---",
"Services||s",
"---",
"Hide Preview|⌘H|",
"Hide Others|⌥⌘H|",
"Show All||o",
"---",
"Quit Preview|⌘Q|"
]
],
[
"File",
[
"New from Clipboard|⌘N|",
"Open…|⌘O|",
"Open Recent||s",
"---",
"Close Window|⌘W|",
"Close Selected Image|⇧⌘W|",
"Save|⌘S|",
"Duplicate|⇧⌘S|",
"Rename…||",
"Move To…||",
"Revert To||s",
"---",
"Enter Password…||o",
"Edit Permissions…||o",
"---",
"Import from iPhone||s|icon:iphone",
"---",
"Import from Camera…||o",
"Import from Scanner…||o",
"Take Screenshot||s",
"---",
"Export…||",
"Export as PDF…||",
"---",
"Share||s|icon:square.and.arrow.up",
"---",
"Print…|⌘P||icon:printer"
]
],
[
"Edit",
[
"Undo|⌘Z|o",
"Redo|⇧⌘Z|o",
"---",
"Cut|⌘X|o",
"Copy|⌘C|",
"Paste|⌘V|o",
"Delete||o",
"Deactivate||o",
"Select All|⌘A|",
"Invert Selection|⇧⌘I|o",
"---",
"Insert||s",
"Move Selected Image to Trash|⌘⌫|",
"---",
"Find||s|icon:magnifyingglass@13-small-semibold",
"---",
"Writing Tools||s",
"Spelling and Grammar||s",
"Speech||s",
"---",
"AutoFill||s|icon:rectangle.and.pencil.and.ellipsis",
"Start Dictation…|🎤||icon:mic",
"Emoji & Symbols|🌐||icon:emoji.face.grinning"
]
],
[
"View",
[
"Show Tab Bar||",
"Show All Tabs|⇧⌘\\|o",
"---",
"Hide Sidebar|⌥⌘1|c",
"Thumbnails|⌥⌘2|",
"Table of Contents|⌥⌘3|o",
"Highlights and Notes|⌥⌘4|o",
"Bookmarks|⌥⌘5|o",
"Contact Sheet|⌥⌘6|",
"---",
"Continuous Scroll|⌘1|o",
"Single Page|⌘2|o",
"Two Pages|⌘3|o",
"---",
"Soft Proof with Profile||s",
"Show Image Background|⌥⌘B|o",
"3D Rendering||s",
"---",
"Actual Size|⌘0|",
"Zoom to Fit|⌘9|co",
"Zoom In|⌘+|",
"Zoom Out|⌘−|",
"Zoom to Selection|⌘*|o",
"---",
"Show Markup Toolbar|⇧⌘A||icon:pencil.tip.crop.circle",
"---",
"Hide Toolbar|⌥⌘T|",
"Customize Toolbar…||",
"---",
"Slideshow|⇧⌘F|",
"Enter Full Screen|🌐F|"
]
],
[
"Go",
[
"Up|↑|o",
"Down|↓|o",
"Previous Item|⌥▲|o",
"Next Item|⌥▼|o",
"Go to Page…|⌥⌘G|o",
"---",
"Back|⌘[|o",
"Forward|⌘]|o"
]
],
[
"Tools",
[
"Show Inspector|⌘I|",
"Show Magnifier|`|",
"---",
"Adjust Color…|⌥⌘C|",
"Adjust Size…||",
"---",
"Automatic Selection||c",
"Rectangular Selection||",
"Text Selection||",
"Redact||o",
"3D Manipulator||s",
"---",
"Annotate||s",
"Add to Scene||s",
"---",
"Add Bookmark|⌘D|o",
"---",
"Rotate Left|⌘L||icon:rotate.left",
"Rotate Right|⌘R||icon:rotate.right",
"Flip Horizontal|||icon:arrow.trianglehead.left.and.right.righttriangle.left.righttriangle.right",
"Flip Vertical|||icon:arrow.trianglehead.up.and.down.righttriangle.up.righttriangle.down",
"Crop|⌘K|o|icon:crop",
"Remove Background|⇧⌘K||icon:circle.rectangle.filled.pattern.diagonalline",
"---",
"Assign Profile…||",
"Show Location Info||o",
"Show Object Properties||o"
]
],
[
"Window",
[
"Minimize|⌘M|",
"Zoom||",
"Fill|⌃🌐F|",
"Center|⌃⌥Space|",
"---",
"Move & Resize||s|icon:inset.filled.righthalf.arrowtriangle.right.rectangle",
"Full Screen Tile||s|icon:rectangle.split.2x1",
"---",
"Bring All to Front||",
"Remove Window from Set||o",
"---",
"Show Previous Tab|⌃⇧⇥|o",
"Show Next Tab|⌃⇥|o",
"Move Tab to New Window||o",
"Merge All Windows||o",
"---",
"Minard, Campagne de Russie 1812-1813.jpg||c|icon:macwindow"
]
],
[
"Help",
[
"Preview Help|||icon:tips"
]
]
],
"apple": [
"About This Mac|||icon:laptopcomputer",
"---",
"System Settings…|||icon:gear",
"App Store|||icon:appstore",
"---",
"Recent Items||s",
"---",
"Force Quit…|⌥⌘⎋|",
"---",
"Sleep||",
"Restart…||",
"Shut Down…||",
"---",
"Lock Screen|⌃⌘Q|",
"Log Out…|⇧⌘Q|"
],
"subs": {
"Finder": {
"Apple > Recent Items": [
"Applications||h",
"Preview|||icon:app:Preview",
"---",
"Documents||h",
"Minard, Campagne de Russie 1812-1813.jpg|||icon:file:image",
"---",
"Clear Menu||"
],
"Edit > Writing Tools": [
"Show Writing Tools||o",
"---",
"Proofread||o",
"Rewrite||o",
"---",
"Make Friendly||o",
"Make Professional||o",
"Make Concise||o",
"---",
"Summarize||o",
"Create Key Points||o",
"Make List||o",
"Make Table||o",
"---",
"Compose…||o"
],
"View > Sort By": [
"None|⌃⌥⌘0|",
"---",
"Snap to Grid||c",
"---",
"Name|⌃⌥⌘1|",
"Kind|⌃⌥⌘2|",
"Date Last Opened|⌃⌥⌘3|",
"Date Added|⌃⌥⌘4|",
"Date Modified|⌃⌥⌘5|",
"Date Created||",
"Size|⌃⌥⌘6|",
"Tags|⌃⌥⌘7|"
],
"View > Clean Up By": [
"Name|⌥⌘1|",
"Kind|⌥⌘2|",
"Date Modified|⌥⌘5|",
"Date Created||",
"Size|⌥⌘6|",
"Tags|⌥⌘7|"
],
"Go > Recent Folders": [
"Desktop|||icon:file:folder-desktop",
"---",
"Clear Menu||"
],
"Window > Move & Resize": [
"Halves||h",
"Left|⌃⌥◀|o|icon:inset.filled.lefthalf.rectangle",
"Right|⌃⌥▶|o|icon:inset.filled.righthalf.rectangle",
"Top|⌃⌥▲|o|icon:inset.filled.tophalf.rectangle",
"Bottom|⌃⌥▼|o|icon:inset.filled.bottomhalf.rectangle",
"---",
"Quarters||h",
"Top Left||o|icon:inset.filled.topleft.rectangle",
"Top Right||o|icon:inset.filled.topright.rectangle",
"Bottom Left||o|icon:inset.filled.bottomleft.rectangle",
"Bottom Right||o|icon:inset.filled.bottomright.rectangle",
"---",
"Arrange||h",
"Left & Right|⌃⇧🌐◀|o|icon:inset.filled.lefthalf.righthalf.rectangle",
"Right & Left|⌃⇧🌐▶|o|icon:inset.filled.righthalf.lefthalf.rectangle",
"Top & Bottom|⌃⇧🌐▲|o|icon:inset.filled.tophalf.bottomhalf.rectangle",
"Bottom & Top|⌃⇧🌐▼|o|icon:inset.filled.bottomhalf.tophalf.rectangle",
"Quarters||o|icon:inset.filled.topleft.topright.bottomleft.bottomright.rectangle",
"---",
"Return to Previous Size||o"
]
},
"Preview": {
"File > Open Recent": [
"Minard, Campagne de Russie 1812-1813.jpg|||icon:file:image",
"---",
"Clear Menu||"
],
"File > Revert To": [
"Browse All Versions…||"
],
"File > Import from iPhone": [
"iPhone||h",
"Take Photo|||icon:camera",
"Scan Documents|||icon:doc.viewfinder",
"Add Sketch||o|icon:scribble"
],
"File > Take Screenshot": [
"From Selection…||",
"From Window…||",
"From Entire Screen||"
],
"File > Share": [
"AirDrop|||icon:app:AirDrop",
"Mail|||icon:app:Mail",
"Shortcuts|||icon:app:Shortcuts",
"Messages|||icon:app:Messages",
"---",
"More…|||icon:ellipsis.circle"
],
"Edit > Insert": [
"Page from File…||o",
"Blank Page||o"
],
"Edit > Find": [
"Find…|⌘F|o",
"Find Next|⌘G|o",
"Find Previous|⇧⌘G|o",
"Use Selection for Find|⌘E|o",
"Jump to Selection|⌘J|o"
],
"Edit > Spelling and Grammar": [
"Show Spelling and Grammar|⌘:|",
"Check Document Now|⌘;|o",
"---",
"Check Spelling While Typing||o",
"Check Grammar With Spelling||o",
"Correct Spelling Automatically||o"
],
"Edit > Speech": [
"Start Speaking||o",
"Stop Speaking||o"
],
"Edit > AutoFill": [
"Contact…||o|icon:person.crop.circle",
"Passwords…||o|icon:key.dots.fill",
"Credit Card…||o|icon:creditcard"
],
"View > Soft Proof with Profile": [
"None||c",
"---",
"ACES CG Linear (Academy Color Encoding System AP1)||",
"Adobe RGB (1998)||",
"Claude 1||",
"Claude 2||",
"Claude 3||",
"Color LCD||",
"Display P3||",
"Generic CMYK Profile||",
"Generic Gray Gamma 2.2 Profile||",
"Generic Gray Profile||",
"Generic RGB Profile||",
"LG TV SSCR2||",
"Rec. ITU-R BT.2020-1||",
"Rec. ITU-R BT.709-5||",
"ROMM RGB: ISO 22028-2:2013||",
"SMPTE RP 431-2-2007 DCI (P3)||",
"sRGB IEC61966-2.1||"
],
"View > 3D Rendering": [
"Photoreal Rendering||o",
"---",
"Renderer||h",
"RealityKit||co",
"OpenUSD Storm||o",
"Raytracer||o",
"---",
"Environment||h",
"Studio||co",
"Overcast||o",
"Sunny||o",
"Dusk||o",
"Night||o",
"City Night||o",
"Office Interior||o"
],
"Tools > 3D Manipulator": [
"Move|⌥W|o",
"Rotate|⌥E|o",
"Scale|⌥R|o",
"---",
"Adjust Pivot||s"
],
"Tools > Annotate": [
"Highlight Text|⌃⌘H||icon:highlighter",
"Underline Text|⌃⌘U||icon:underline",
"Strike Through Text|⌃⌘S||icon:strikethrough",
"---",
"Rectangle|⌃⌘R||icon:rectangle",
"Oval|⌃⌘O||icon:oval",
"Line|⌃⌘I||icon:line.diagonal",
"Arrow|⌃⌘A||icon:line.diagonal.trianglehead.up.right",
"Polygon|||icon:hexagon",
"Star|||icon:star",
"---",
"Text|⌃⌘T||icon:character.textbox",
"Speech Bubble|||icon:bubble",
"---",
"Mask|||icon:squareshape.squareshape.dotted",
"Loupe|⌃⌘L||icon:character.magnify",
"---",
"Note|⌃⌘N|o|icon:note",
"Signature||s|icon:signature"
],
"Tools > Add to Scene": [
"Transform||o",
"---",
"Shapes||h",
"Capsule||o",
"Cone||o",
"Cube||o",
"Cylinder||o",
"Plane||o",
"Sphere||o",
"---",
"Cameras||h",
"Standard||o",
"Immersive||o",
"---",
"Lights||h",
"Cylinder||o",
"Disk||o",
"Distant||o",
"Dome||o",
"Rectangle||o",
"Sphere||o"
],
"Window > Full Screen Tile": [
"Left of Screen|||icon:inset.filled.lefthalf.rectangle",
"Right of Screen|||icon:inset.filled.righthalf.rectangle"
],
"Apple > Recent Items": [
"Applications||h",
"Preview|||icon:app:Preview",
"---",
"Documents||h",
"Minard, Campagne de Russie 1812-1813.jpg|||icon:file:image",
"---",
"Clear Menu||"
],
"Edit > Writing Tools": [
"Show Writing Tools||o",
"---",
"Proofread||o",
"Rewrite||o",
"---",
"Make Friendly||o",
"Make Professional||o",
"Make Concise||o",
"---",
"Summarize||o",
"Create Key Points||o",
"Make List||o",
"Make Table||o",
"---",
"Compose…||o"
],
"Window > Move & Resize": [
"Halves||h",
"Left|⌃⌥◀||icon:inset.filled.lefthalf.rectangle",
"Right|⌃⌥▶||icon:inset.filled.righthalf.rectangle",
"Top|⌃⌥▲||icon:inset.filled.tophalf.rectangle",
"Bottom|⌃⌥▼||icon:inset.filled.bottomhalf.rectangle",
"---",
"Quarters||h",
"Top Left|||icon:inset.filled.topleft.rectangle",
"Top Right|||icon:inset.filled.topright.rectangle",
"Bottom Left|||icon:inset.filled.bottomleft.rectangle",
"Bottom Right|||icon:inset.filled.bottomright.rectangle",
"---",
"Arrange||h",
"Left & Right|⌃⇧🌐◀||icon:inset.filled.lefthalf.righthalf.rectangle",
"Right & Left|⌃⇧🌐▶||icon:inset.filled.righthalf.lefthalf.rectangle",
"Top & Bottom|⌃⇧🌐▲||icon:inset.filled.tophalf.bottomhalf.rectangle",
"Bottom & Top|⌃⇧🌐▼||icon:inset.filled.bottomhalf.tophalf.rectangle",
"Quarters|||icon:inset.filled.topleft.topright.bottomleft.bottomright.rectangle",
"---",
"Return to Previous Size||o"
]
}
},
"icons": {
"airdrop": [
14.0,
13.0
],
"appstore": [
13.0,
12.0
],
"arrow.down.circle": [
13.0,
13.0
],
"arrow.trianglehead.left.and.right.righttriangle.left.righttriangle.right": [
16.0,
14.0
],
"arrow.trianglehead.up.and.down.righttriangle.up.righttriangle.down": [
15.0,
15.0
],
"book.pages": [
13.0,
16.0
],
"bubble": [
15.0,
13.0
],
"camera": [
16.0,
12.0
],
"character.magnify": [
15.0,
12.0
],
"character.textbox": [
16.0,
12.0
],
"checkmark": [
13.0,
11.0
],
"chevron.right": [
9.0,
12.0
],
"circle.rectangle.filled.pattern.diagonalline": [
15.0,
12.0
],
"clock": [
13.0,
13.0
],
"creditcard": [
15.0,
11.0
],
"crop": [
15.0,
14.0
],
"doc": [
12.0,
13.0
],
"document.viewfinder": [
14.0,
13.0
],
"eject": [
13.0,
12.0
],
"ellipsis.circle": [
13.0,
13.0
],
"emoji.face.grinning": [
13.0,
13.0
],
"gear": [
14.0,
14.0
],
"globe": [
13.0,
13.0
],
"hexagon": [
14.0,
14.0
],
"highlighter": [
14.0,
14.0
],
"house": [
16.0,
13.0
],
"icloud": [
15.0,
12.0
],
"inset.filled.bottomhalf.rectangle": [
15.0,
12.0
],
"inset.filled.bottomhalf.tophalf.rectangle": [
15.0,
12.0
],
"inset.filled.bottomleft.rectangle": [
15.0,
12.0
],
"inset.filled.bottomright.rectangle": [
15.0,
12.0
],
"inset.filled.lefthalf.rectangle": [
15.0,
12.0
],
"inset.filled.lefthalf.righthalf.rectangle": [
15.0,
12.0
],
"inset.filled.righthalf.arrowtriangle.right.rectangle": [
15.0,
12.0
],
"inset.filled.righthalf.lefthalf.rectangle": [
15.0,
12.0
],
"inset.filled.righthalf.rectangle": [
15.0,
12.0
],
"inset.filled.tophalf.bottomhalf.rectangle": [
15.0,
12.0
],
"inset.filled.tophalf.rectangle": [
15.0,
12.0
],
"inset.filled.topleft.rectangle": [
15.0,
12.0
],
"inset.filled.topleft.topright.bottomleft.bottomright.rectangle": [
15.0,
12.0
],
"inset.filled.topright.rectangle": [
15.0,
12.0
],
"iphone": [
12.0,
14.0
],
"key.dots.fill": [
13.0,
14.0
],
"laptopcomputer": [
19.0,
11.0
],
"line.diagonal": [
11.0,
11.0
],
"line.diagonal.trianglehead.up.right": [
11.0,
11.0
],
"list.bullet": [
14.0,
10.0
],
"macwindow": [
15.0,
12.0
],
"magnifyingglass@13-small-semibold": [
12.0,
13.0
],
"magnifyingglass@14-small-semibold": [
13.0,
13.0
],
"menubar.dock.rectangle": [
15.0,
12.0
],
"mic": [
12.0,
14.0
],
"network": [
13.0,
13.0
],
"note": [
14.0,
12.0
],
"oval": [
16.0,
13.0
],
"pencil.tip.crop.circle": [
13.0,
13.0
],
"person.2": [
17.0,
13.0
],
"person.crop.circle": [
13.0,
13.0
],
"printer": [
15.0,
14.0
],
"rectangle.and.pencil.and.ellipsis": [
19.0,
13.0
],
"rectangle": [
15.0,
12.0
],
"rectangle.split.2x1": [
15.0,
12.0
],
"rectangle.split.3x1": [
15.0,
12.0
],
"rotate.left": [
12.0,
14.0
],
"rotate.right": [
12.0,
14.0
],
"scribble": [
13.0,
13.0
],
"signature": [
19.0,
14.0
],
"square.and.arrow.up": [
13.0,
15.0
],
"square.grid.2x2": [
13.0,
12.0
],
"squares.below.rectangle": [
15.0,
12.0
],
"squareshape.squareshape.dotted": [
13.0,
12.0
],
"star": [
14.0,
14.0
],
"strikethrough": [
12.0,
10.0
],
"tag": [
16.0,
16.0
],
"tips": [
13.0,
15.0
],
"trash": [
13.0,
14.0
],
"underline": [
10.0,
12.0
],
"wrench.and.screwdriver": [
15.0,
15.0
]
}
};
