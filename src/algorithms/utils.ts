
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

function sample<T>(arr: T[], size?: number, rnd?: ()=>number) {

    const random = rnd ?? Math.random;

    const shuffled = arr.slice(0);
    let i = arr.length, temp, index;

    while (i--) {
        index = Math.floor((i + 1) * random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size ?? shuffled.length);
}

 
const format = new Intl.NumberFormat("de-DE");

function formatNumber(s: number): string {
    return s<1000 ? s.toString() : format.format(s).replaceAll(".", "\u2009");
}

function formatTime(millis: number): string {
    const thousandths = (millis % 1000).toString().padStart(3, "0");
    const secs = ((Math.floor(millis / 1000)) % 60).toString().padStart(2, "0");
    const mins = Math.floor(millis / 60000).toString();
    return `${mins}:${secs},${thousandths}`;
}


export { Random, sample, formatNumber, formatTime };


declare global {
    interface Array<T> {
        sample(size?: number, ): T[];
        sum(): number;
    }    
}

// eslint-disable-next-line no-extend-native
Array.prototype.sample = function<T>(n: number, rnd?: ()=>number)  { 
    return sample<T>(this, n, rnd)
}

// eslint-disable-next-line no-extend-native
Array.prototype.sum = function() {
    return this.reduce( (a,c) => a+c);
}

  
