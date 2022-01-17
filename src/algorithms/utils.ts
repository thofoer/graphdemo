
const Random = (seed: string) => {
    
    let a = 0;    
    for (let i = 0; i < seed.length; i++) {        
        a  = ((a << 5) - a) + seed.charCodeAt(i);
        a |= 0; // Convert to 32bit integer
    }

    return (min: number = 0, max: number = 1) => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      const res = min + (max-min) * (((t ^ (t >>> 14)) >>> 0) / 4294967296);
      return max > 1 ? Math.floor(res) : res;
    }

}

export { Random };