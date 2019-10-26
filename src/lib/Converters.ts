
class Converters {
	string(v: string) { return v; }
	integer(v: string) { return parseInt(v); }
	float(v: string) { return parseFloat(v); }
	number(v: string) { return Number(v); }
	json(v: string) { return JSON.parse(v); }
	boolean(v: string) {
		v = v.toLowerCase();
		return (v === 'true');
	}
	date(v: string) { return new Date(v); }
	ticks(v: string) { return new Date(Number(v)); }
	exists(v: string) { return (v !== null); }
};

export default Converters;
