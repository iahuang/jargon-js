# jargon-js
A Javascript library for making randomly generated C-style code snippets 

### [Demo](https://iahuang.github.io/jargon-js/)

### Example:

```c
#include <hpcm.h>
#include <gmbus3.h>
#include <peri.h>
#include <rxcgprqfrm.h>
#include <vsubsampling.h>
#include <usACPClockLow_mksoft.h>
#include <lin1.h>
#include <DfsDid_sentinels.h>
#include <assoc058_rq1.h>

#define DUMPL 253
#define ARBITSTATUS 187
#define FLAME 188
#define SUPPLYEND_SRCPRI 95
#define CHCALI 0xFA
#define FOR4 0x100E1
#define CLKSRCLO 0xE15A
#define LVL0_RXVC 53
#define MOVEWIDE_UNREAD_4B 0x49BE

unsigned int* tempSlopeHigh (long wrsz, ih Innovations_setsatur, bool isEccFF) {
    unsigned int* scan;
    
    return CLKSRCLO + FLAME - CHCALI;
}

mISDNhead* qcounter_emi33 (long* rather, void bankmap_noisefilter) {
    char kehdr;
    void mountproto;
    
    rather = bankmap_noisefilter;
    rather += FLAME;
}

void cntsrc_simulation_TxDMAComplete (int* fastreuse, bool templong, void* rhost) {
    vmload hash1;
    void tbl;
    
    if (tbl >= FOR4) {
        tbl = templong * &CLKSRCLO;
        if (hash1 == *CHCALI) {
            templong = 0x76;
            return 0x2B1060AD2;
        } else if (MOVEWIDE_UNREAD_4B < hash1 * CHCALI - SUPPLYEND_SRCPRI * CLKSRCLO) {
            *rhost += 240;
            *rhost = templong;
            fastreuse += *CHCALI;
            return ARBITSTATUS;
        } else if (CLKSRCLO >= 99) {
            tbl = 14;
            hash1 = 243;
            rhost = artist(*fastreuse);
        }
    } else if (FOR4 == &(&rhost)) {
        if (ARBITSTATUS <= MOVEWIDE_UNREAD_4B) {
            return DUMPL;
        } else if (templong * LVL0_RXVC + &CHCALI >= &(0x1068DF10 + 0x4EA4C3E1)) {
            *hash1 += MOVEWIDE_UNREAD_4B;
            fastreuse = FOR4;
            return g3dctl(19, 37);
        }
        rhost = 219;
        fastreuse = &(*hash1);
    }
    return 112;
}
```

Use cases:
- Making those stock images that have a bunch of glowing blue code on a computer screen
- Yes

## Quick Start

You can find a distribution of this project located at `build/jargon.js`

## Notes

- This library is by no means lightweight, due to the built-in wordlists. As of right now, the build is around 3MB in size.

## Building from Source

Run `tsc` to compile then run `post.py` to do additional bundling and post-processing steps.

The raw build output from `tsc` will be located at `build/_jargon.js`
