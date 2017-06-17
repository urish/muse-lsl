# muse-lsl

Stream data from [Muse EEG Headset](http://www.choosemuse.com/) (2016 edition) to [Lab Streaming Layer](https://github.com/sccn/labstreaminglayer).

## Installation

Clone this repo:

    git clone https://github.com/urish/muse-lsl

Install dependencies with yarn:
    
    yarn

Or npm:

    npm install

Then, make sure you have the LSL library installed. You can download the latest 
version from ftp://sccn.ucsd.edu/pub/software/LSL/SDK/ .
Basically, you need `liblsl64.so`/`liblsl64.dll`/`liblsl64.dylib` (depending on your platform) somewhere in your path.

Finally, follow the instructions to [set up Noble for your platform](https://github.com/sandeepmistry/noble#prerequisites).

## Running

Simply `npm start`
