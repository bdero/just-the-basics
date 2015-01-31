Just The Basics
===============
A continuous top-down shooter in the style of Grid Wars 2. At this point, it's
largely incomplete but still in development.

Try it out
----------
Simply clone the repository using
`git clone git@github.com:bdero/just-the-basics.git` and navigate to
`index.html` using a modern web browser that supports WebGL.

How to control
--------------
* Move using the classic W, A, S, and D keys, or the arrow keys
* Aim by either hovering the mouse over the canvas, or, if your browser supports
  it, left click the canvas and accept the Pointer Lock request
* Continuously shoot by holding the left mouse button down

Building for Android with Crosswalk
-----------------------------------
*Note: Currently, there are no touch controls for acctually moving the ship
around on mobile devices. Because of this, its only really playable on devices
with hardware keyboards right now.*

1. Follow the [Linux host setup](https://crosswalk-project.org/documentation/getting_started/linux_host_setup.html)
   or [Windows host setup](https://crosswalk-project.org/documentation/getting_started/windows_host_setup.html)
   instructions to setup your environment for building with Crosswalk against
   the Android SDK.
2. If you haven't done so already while following the setup instructions above,
   download the latest stable **Android (ARM + x86)** build of Crosswalk
   [here](https://crosswalk-project.org/documentation/downloads.html) and
   extract it.
3. Set the `CROSSWALK_PATH` environment variable to the path of the extracted
   contents of Crosswalk
   (e.g. `export CROSSWALK_PATH=/home/myuser/path/to/crosswalk-10.39.235.15`).
4. Run the debug build script located in the root of this repository:
   `./build.sh`
5. If the build is successful, two APKs should appear in the `bin` directory of
   this repository. Deploy the package matching the architecture of your device
   (i.e. ARM or x86) using your preferred method
   (e.g. `adb install -r bin/Basics_0.0.0.1_arm.apk`).

License
-------
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
