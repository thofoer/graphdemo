/* eslint-disable no-extend-native */

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

function probCheck(prob: number, rnd: ()=>number = Math.random) {
    return rnd() < prob;
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

function geoDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371e3; // metres
    const ξ = Math.PI/180;

    const φ1 = lat1 * ξ; // φ, λ in radians
    const φ2 = lat2 * ξ;
    const Δφ = (lat2-lat1) * ξ;
    const Δλ = (lng2-lng1) * ξ;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1)   * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return (R * c) / 1000; // in kilometres
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


export { Random, sample, formatNumber, formatTime, probCheck, geoDistance };



declare global {
    interface Array<T> {
        sample(size?: number, ): T[];
        sum(): number;
        first(): T;
        last(): T;
    }    
}


Array.prototype.sample = function<T>(n: number, rnd?: ()=>number)  { 
    return sample<T>(this, n, rnd);
}

Array.prototype.sum = function() {
    return this.reduce( (a,c) => a+c);
}

Array.prototype.first = function() {
    return this[0];
}

Array.prototype.last = function() {
    return this[this.length-1];
}
  
