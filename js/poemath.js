/*

Adding new plot
---------------

* Add link to navigation menu
* Add form and plot block
* Equations for Fun object
* Tests for equations
* Create new Fun object
* Create graph for input fields update
* Update plot functions
* Initilize values of Fun object from form
* Add events to form

*/

function Fun(f){
	this.f = f; 					// functions for variables
	this.v = new Array(f.length);	// values of variables

	this.set_v = function(v){
		this.v = v;
	}

	this.get_data = function(x, y, xmin, xmax, n){
		var r = xmax - xmin;
		var step = r/n;
		var data = [];
		for(var i=0; i<=n; i++){ // xmax included
			var xn = xmin + step * i;
			var yn, values;
			values = this.v.slice();
			values[x] = xn;
			yn = this.f[y](values);
			data.push([xn, yn]);
		}
		return data;
	}

	this.get_v = function(fid, custom_val){
		if(typeof custom_val === 'undefined'){
			return this.f[fid](this.v);
		}
		else {
			var v = this.v.slice();
			v[custom_val.vid] = custom_val.v;
			return this.f[fid](v);
		}
	}
}

function fit_in_range(x, minv, maxv){
	if (x>maxv)
		x = maxv;
	else if (x<minv)
		x = minv;
	return x;
}

// Forms
function update_value(fun_obj, graph){
	var updated = [],
		g = graph,
		v, first;
		first = g;
	while(updated.indexOf(g.fid)===-1){
		fun_obj.v[g.vid] = parseFloat($(g.fid).val());
		if(g.n.fid !== first.fid){
			v = fun_obj.get_v(g.n.vid);
			v = Math.round(v*100) / 100;
			$(g.n.fid).val(v);
		}
		updated.push(g.fid);
		g = g.n;
	}
}

// Plot
function get_plot_data(label, data){
	return [{
		data: data,
		shadowSize: 0,
		label: label
	}];
}

function get_plot_options(legend_position, xlabel, ylabel){
	return {
		crosshair: {
			mode: 'xy'
		},
		legend: {
			position: legend_position
		},
		xaxes: [{
			axisLabel: xlabel
		}],
		yaxes: [{
			axisLabel: ylabel
		}]
	};
}

// Chance To Hit Section
function cth_aa(v){
	var aa = v[0],
		de = v[1],
		cth = v[2];
	cth = fit_in_range(cth, 0.05, 0.95);
	var aa = cth * Math.pow(de/4, 0.8) / (1-cth);
	return aa;
}

function cth_de(v){
	var aa = v[0],
		de = v[1],
		cth = v[2];
	cth = fit_in_range(cth, 0.05, 0.95);
	var de = 4 * Math.pow( (aa-cth*aa)/cth, 1.25);
	return de;
}

function cth_cth(v){
	var aa = v[0],
		de = v[1],
		cth = v[2];
	var cth = aa / (aa + Math.pow(de/4, 0.8));
	cth = fit_in_range(cth, 0.05, 0.95);
	return cth;
}

function cth_update_plot_1(){
	// cth(aa)
	var data = [];
	var minaa = 0; //cth_fun.get_v(0, {vid: 2, v: 0.05});
	var maxaa = cth_fun.v[0] * 2; //cth_fun.get_v(0, {vid: 2, v: 0.95}) * 1.05;
	data = cth_fun.get_data(0, 2, minaa, maxaa, 100);
	$.plot($('#cth_plot_1'),
		   get_plot_data('Defender\'s Evasion=' + cth_fun.v[1], data),
		   get_plot_options('se', 'attacker\'s accuracy', 'chance to hit'));
}

function cth_update_plot_2(){
	// cth(de)
	var data = [];
	var minde = 0; //cth_fun.get_v(1, {vid: 2, v: 0.05});
	var maxde = cth_fun.v[1] * 2; //cth_fun.get_v(1, {vid: 2, v: 0.95}) * 1.05;
	data = cth_fun.get_data(1, 2, minde, maxde, 100);
	$.plot($('#cth_plot_2'),
		  get_plot_data('Attacker\'s Accuracy=' + cth_fun.v[0], data),
		  get_plot_options('ne', 'defender\'s evasion', 'chance to hit'));
}

function cth_update_plot_3(){
	// de(aa)
	var data = [];
	var minaa = cth_fun.v[0] - cth_fun.v[0] * 0.8;
	var maxaa = cth_fun.v[0] * 2;
	data = cth_fun.get_data(0, 1, minaa, maxaa, 100);
	$.plot($('#cth_plot_3'),
		  get_plot_data('Chance To Hit=' + cth_fun.v[2], data),
		  get_plot_options('se', 'attacker\'s accuracy', 'defender\'s evasion'));
}

function cth_update_plots(){
	cth_update_plot_1();
	cth_update_plot_2();
	cth_update_plot_3();
}

// End - Chance To Hit Section

// Chance To Avoid Attack Section
function caa_aa(v){
	var aa = v[0],
		de = v[1],
		ctd = v[2],
		caa = v[3];
	caa = fit_in_range(caa, 0.05, 0.95);
	aa = (1-caa) * Math.pow(de/4, 0.8)/(caa-ctd)
	return aa;
}

function caa_de(v){
	var aa = v[0],
		de = v[1],
		ctd = v[2],
		caa = v[3];
	caa = fit_in_range(caa, 0.05, 0.95);
	de = Math.pow(aa * (caa-ctd)/(1-caa), 1.25) * 4;
	return de;
}

function caa_caa(v){
	var aa = v[0],
		de = v[1],
		ctd = v[2],
		caa = v[3];
	var cte = 1-cth_cth([aa, de, null]);
	caa = 1 - ((1-cte) * (1-ctd));
	caa = fit_in_range(caa, 0.05, 0.95);
	return caa;
}

function caa_update_plot_1(){
	// caa(de)
	var data = [];
	var minde = 0;
	var maxde = caa_fun.v[1] * 2;
	data = caa_fun.get_data(1, 3, minde, maxde, 100);
	$.plot($('#caa_plot_1'),
		get_plot_data('AA=' + caa_fun.v[0] + ', CTD=' + caa_fun.v[2], data),
		get_plot_options('nw', 'defender\'s evasion', 'chance  to avoid attack'));
}

function caa_update_plot_2(){
	// caa(aa)
	var data = [];
	var minaa = 0;
	var maxaa = caa_fun.v[0] * 2;
	data = caa_fun.get_data(0, 3, minaa, maxaa, 100);
	$.plot($('#caa_plot_2'),
		get_plot_data('DE=' + caa_fun.v[1] + ', CTD=' + caa_fun.v[2], data),
		get_plot_options('ne', 'attacker\'s accuracy', 'chance  to avoid attack'));
}

function caa_update_plot_3(){
	// aa(de)
	var data = [];
	var minde = 0;
	var maxde = caa_fun.v[0] * 2;
	data  = caa_fun.get_data(1, 0, minde, maxde, 100);
	$.plot($('#caa_plot_3'),
		get_plot_data('CTD=' + caa_fun.v[2] + ', CAA=' + caa_fun.v[3], data),
		get_plot_options('se', 'defender\'s evasion', 'attacker\'s accuracy'));
}

function caa_update_plots(){
	caa_update_plot_1();
	caa_update_plot_2();
	caa_update_plot_3();
}

// End - Chance To Avoid Attack Section

// Block Duration Section
function bd_br(v){
	var br = v[0],
		bd = v[1];
	br = (350 - bd)/bd*100;
	return br;
}

function bd_bd(v){
	var br = v[0],
		bd = v[1];
	bd = 350/(1 + br/100);
	return bd;
}

function bd_update_plot(){
	// bd(br)
	var data = [];
	var minbr = 0;
	var maxbr = 10;
	if(bd_fun.v[0]!==0){
		var maxbr = bd_fun.v[0] * 2;
	}
	data = bd_fun.get_data(0, 1, minbr, maxbr, 100);
	$.plot($('#bd_plot'),
		get_plot_data('Block Duration', data),
		get_plot_options('ne', 'block recovery', 'block duration'));
}

// End - Block Duration Section

// Status Ailment Duration Section
function sad_ed(v){
	var ed = v[0],
		tml = v[1],
		d = v[2],
		sad = v[3];
	ed = sad * tml / (d * 100);
	if(ed>tml/3){
		ed = tml/3;
	}
	return ed;
}

function sad_tml(v){
	var ed = v[0],
		tml = v[1],
		d = v[2],
		sad = v[3];
	tml = ed * d * 100 / sad;
	if(tml<3*ed){
		tml = 3 * ed;
	}
	return tml;
}

function sad_sad(v){
	var ed = v[0],
		tml = v[1],
		d = v[2],
		sad = v[3];
	if(ed>tml/3){
		ed = tml/3;
	}
	sad = ed * 100 * d / tml;
	if(sad<300){
		sad = 0;
	}
	return sad;
}

function sad_update_plot_1(){
	// sad(ed)
	var data = [];
	var mined = 10;
	var maxed = sad_fun.v[0] * 2;
	data = sad_fun.get_data(0, 3, mined, maxed, 100);
	$.plot($('#sad_plot_1'),
		  get_plot_data('Target Maximum Life=' + sad_fun.v[1], data),
		  get_plot_options('se', 'damage', 'status ailment duration'));
}

function sad_update_plot_2(){
	// sad(tml)
	var data = [];
	var mintml = 10;
	var maxtml = sad_fun.v[1] * 2;
	data = sad_fun.get_data(1, 3, mintml, maxtml, 100);
	$.plot($('#sad_plot_2'),
		  get_plot_data('Damage=' + sad_fun.v[0], data),
		  get_plot_options('ne', 'target maximum life', 'status ailment duration'));
}

function sad_update_plot_3(){
	// ed(tml)
	var data = [];
	var mintml = 10;
	var maxtml = sad_fun.v[1] * 2;
	data = sad_fun.get_data(1, 0, mintml, maxtml, 100);
	$.plot($('#sad_plot_3'),
		  get_plot_data('Status Ailment Duration=' + sad_fun.v[3], data),
		  get_plot_options('se', 'target maximum life', 'damage'));
}

function sad_update_plots(){
	sad_update_plot_1();
	sad_update_plot_2();
	sad_update_plot_3();
}

// End - Status Ailment Duration Section

// Damage Reduction Section
function dr_a(v){
	var a = v[0],
		d = v[1],
		dr = v[2];
	if(dr>90){
		dr = 90;
	}
	a = 12 * dr * d / (100 - dr);
	return a;
}

function dr_d(v){
	var a = v[0],
		d = v[1],
		dr = v[2];
	if(dr>90){
		dr = 90;
	}
	d = a * (100 - dr) / (12 * dr);
	return d;
}

function dr_dr(v){
	var a = v[0],
		d = v[1],
		dr = v[2];
	dr = a / (a + 12 * d) * 100;
	if(dr>90){
		dr = 90;
	}
	return dr;
}

function dr_update_plot_1(){
	// dr(a)
	var data = [];
	var mina = 0;
	var maxa = dr_fun.v[0] * 2;
	data = dr_fun.get_data(0, 2, mina, maxa, 100);
	$.plot($('#dr_plot_1'),
		get_plot_data('Damage='+dr_fun.v[1], data),
		get_plot_options('nw', 'armour', 'damage reduction'));
}

function dr_update_plot_2(){
	// dr(d)
	var data = [];
	var mind = 1;
	var maxd = dr_fun.v[1] * 2;
	data = dr_fun.get_data(1, 2, mind, maxd, 100);
	$.plot($('#dr_plot_2'),
		get_plot_data('Armour='+dr_fun.v[0], data),
		get_plot_options('ne', 'damage', 'damage reduction'));
}

function dr_update_plot_3(){
	// d(a)
	var data = [];
	var mina = 0;
	var maxa = dr_fun.v[0] * 2;
	data = dr_fun.get_data(0, 1, mina, maxa, 100);
	$.plot($('#dr_plot_3'),
		get_plot_data('Damage Reduction='+dr_fun.v[2], data),
		get_plot_options('se', 'armour', 'damage'));
}

function dr_update_plots(){
	dr_update_plot_1();
	dr_update_plot_2();
	dr_update_plot_3();
}
// End - Damage Reduction Section

// Stun Chance Section
function sc_deml(v){
	var deml = v[0],
		d = v[1],
		es = v[2],
		sc = v[3];
	sc = sc / es;
	deml = 2 * d / sc;
	return deml;
}

function sc_d(v){
	var deml = v[0],
		d = v[1],
		es = v[2],
		sc = v[3];
	sc = sc / es;
	d = sc * deml / 2;
	return d;
}

function sc_sc(v){
	var deml = v[0],
		d = v[1],
		es = v[2],
		sc = v[3];
	sc = 2 * d / deml;
	if(sc<=0.25){
		sc = 0;
	}
	else if(sc>1){
		sc = 1;
	}
	sc = sc * es;
	return sc;
}

function sc_update_plot_1(){
	// sc(deml)
	var data = [];
	var mindeml = sc_fun.v[1]+1;
	var maxdeml = sc_fun.v[0] * 2;
	data = sc_fun.get_data(0, 3, mindeml, maxdeml, 100);
	$.plot($('#sc_plot_1'),
		get_plot_data('Damage='+sc_fun.v[1], data),
		get_plot_options('ne', 'defender effective maximum life', 'stun chance'));
}

function sc_update_plot_2(){
	// sc(d)
	var data = [];
	var mind = 1;
	var maxd = sc_fun.v[1] * 2;
	data = sc_fun.get_data(1, 3, mind, maxd, 100);
	$.plot($('#sc_plot_2'),
		get_plot_data('Defender Effective Maximum Life='+sc_fun.v[0], data),
		get_plot_options('se', 'damage', 'stun chance'));
}

function sc_update_plot_3(){
	// d(deml)
	var data = [];
	var mindeml = 1;
	var maxdeml = sc_fun.v[0] * 2;
	data = sc_fun.get_data(0, 1, mindeml, maxdeml, 100);
	$.plot($('#sc_plot_3'),
		get_plot_data('Stun Chance='+sc_fun.v[3], data),
		get_plot_options('se', 'defender effective maximum life', 'damage'));
}

function sc_update_plots(){
	sc_update_plot_1();
	sc_update_plot_2();
	sc_update_plot_3();
}
// End - Stun Chance Section

function initialize() {
	QUnit.config.altertitle = false;

	if(window.location.hash==='#test'){
		$('#test').show();
		run_tests();
	}

	// CTH init
	cth_fun.v[0] = parseInt($('#cth_aa').val());
	cth_fun.v[1] = parseInt($('#cth_de').val());
	update_value(cth_fun, cth_graph.n.n) // aa
	cth_update_plots();

	// CAA init
	caa_fun.v[0] = parseInt($('#caa_aa').val());
	caa_fun.v[1] = parseInt($('#caa_de').val());
	caa_fun.v[2] = parseFloat($('#caa_ctd').val());
	update_value(caa_fun, caa_graph.n.n); // de
	caa_update_plots();

	// BD init
	bd_fun.v[0] = parseInt($('#bd_br').val());
	update_value(bd_fun, bd_graph); // br
	bd_update_plot();

	// SAD init
	sad_fun.v[0] = parseInt($('#sad_ed').val());
	sad_fun.v[1] = parseInt($('#sad_tml').val());
	sad_fun.v[2] = parseInt($('#sad_d').val());
	update_value(sad_fun, sad_graph.n.n); // ed
	sad_update_plots();

	// DR init
	dr_fun.v[0] = parseInt($('#dr_a').val());
	dr_fun.v[1] = parseInt($('#dr_d').val());
	update_value(dr_fun, dr_graph.n.n); // d
	dr_update_plots();

	// SC init
	sc_fun.v[0] = parseInt($('#sc_deml').val());
	sc_fun.v[1] = parseInt($('#sc_d').val());
	sc_fun.v[2] = parseInt($('#sc_sces').val());
	update_value(sc_fun, sc_graph.n.n); // deml
	sc_update_plots();
}

function run_tests(){
	test("Fit in range", function(){
		equal(fit_in_range(0, 1, 2), 1);
		equal(fit_in_range(3, 1, 2), 2);
	});
	test("Fun", function(){
		// z = x + y
		var fx, fy, fz;
		var g;
		fz = function(v){
			var x = v[0],
				y = v[1],
				z = v[2];
			return x + y;
		};
		fx = function(v){
			var x = v[0],
				y = v[1],
				z = v[2];
			return z - y;
		};
		fy = function(v){
			var x = v[0],
				y = v[1],
				z = v[2];
			return z - x;
		};
		g = new Fun([fx, fy, fz]);
		g.set_v([1, 1, 2]);
		equal(g.get_v(0), g.v[0]);
		equal(g.get_v(1), g.v[1]);
		equal(g.get_v(2), g.v[2]);
		var data;
		data = g.get_data(0, 2, 0, 2, 2);
		equal(data.length, 3);
		deepEqual(data, [[0, 1], [1, 2], [2, 3]]);
		g.set_v([2, 2, 4]);
		equal(g.get_v(0), 2);
		equal(g.get_v(1), 2);
		equal(g.get_v(2), 4);
		
		equal(g.get_v(2, {vid: 0, v: 0}), 2);
		equal(g.get_v(2, {vid: 1, v: 0}), 2);
		equal(g.get_v(0, {vid: 2, v: 0}), -2);
	});
	test('Chance To Hit', function(){
		var cth_val = cth_cth([100, 200, null]);
		ok(Math.abs(100-cth_aa([null, 200, cth_val]))<5);
		ok(Math.abs(200-cth_de([100, null, cth_val]))<5);
	});
	test('Chance To Avoid Attack', function(){
		var caa_val = caa_caa([100, 200, 0.2, null]);
		ok(Math.abs(100-caa_aa([null, 200, 0.2, caa_val]))<5);
		ok(Math.abs(200-caa_de([100, null, 0.2, caa_val]))<5);
	});
	test('Block Duration', function(){
		var bd_val = bd_bd([0.2, null]);
		ok(Math.abs(0.2-bd_br([null, bd_val]))<1);
	});
	test('Status Ailment Duration', function(){
		var sad_val = sad_sad([200, 3000, 138, null]);
		ok(Math.abs(200-sad_ed([null, 3000, 138, sad_val]))<1);
		ok(Math.abs(3000-sad_tml([200, null, 138, sad_val]))<1);
	});
	test('Damage Reduction', function (){
		var dr_val = dr_dr([1200, 200, null]);
		ok(Math.abs(1200-dr_a([null, 200, dr_val]))<1);
		ok(Math.abs(200-dr_d([1200, null, dr_val]))<1);
	});
	test('Stun Chance', function(){
		var sc_val = sc_sc([1000, 300, 0.5, null]);
		ok(Math.abs(1000 - sc_deml([null, 300, 0.5, sc_val]))<1);
		ok(Math.abs(300 - sc_d([1000, null, 0.5, sc_val]))<1);
	});
}

var cth_fun = new Fun([cth_aa, cth_de, cth_cth]);
var cth_graph = {
	fid: '#cth_de',
	vid: 1,
	n: {
		fid: '#cth_cth',
		vid: 2,
		n: {
			fid: '#cth_aa',
			vid: 0,
			n: null
		}
	}
};
cth_graph.n.n.n = cth_graph.n; // de->cth->aa->cth...

var caa_fun = new Fun([caa_aa, caa_de, null, caa_caa]);
var caa_graph = {
	fid: '#caa_aa',
	vid: 0,
	n: {
		fid: '#caa_caa',
		vid: 3,
		n: {
			fid: '#caa_de',
			vid: 1,
			n: null
		}
	}
};
caa_graph.n.n.n = caa_graph.n; // aa->caa->de->caa...
var caa_ctd_graph = {
	fid: '#caa_ctd',
	vid: 2,
	n: caa_graph.n // ctd->caa
};

var bd_fun = new Fun([bd_br, bd_bd]);
var bd_graph = {
	fid: '#bd_br',
	vid: 0,
	n: {
		fid: '#bd_bd',
		vid: 1,
		n: null
	}
};
bd_graph.n.n = bd_graph // br->bd->br...
var sad_fun = new Fun([sad_ed, sad_tml, null, sad_sad]);
var sad_graph = {
	fid: '#sad_tml',
	vid: 1,
	n: {
		fid: '#sad_sad',
		vid: 3,
		n: {
			fid: '#sad_ed',
			vid: 0,
			n: null
		}
	}

};
var sad_duration_graph = {
	fid: '#sad_d',
	vid: 2,
	n: sad_graph.n // sad
};
sad_graph.n.n.n = sad_graph.n // tml->sad->ed->sad...

var dr_fun = new Fun([dr_a, dr_d, dr_dr]);
var dr_graph = {
	fid: '#dr_d',
	vid: 1,
	n: {
		fid: '#dr_dr',
		vid: 2,
		n: {
			fid: '#dr_a',
			vid: 0,
			n: null
		}
	}
};
dr_graph.n.n.n = dr_graph.n; // d->dr->a->dr...

var sc_fun = new Fun([sc_deml, sc_d, null, sc_sc]);
var sc_graph = {
	fid: '#sc_d',
	vid: 1,
	n: {
		fid: '#sc_sc',
		vid: 3,
		n: {
			fid: '#sc_deml',
			vid: 0,
			n: null
		}
	}
};
sc_graph.n.n.n = sc_graph.n; // d->sc->deml->sc...
var sc_es_graph = {
	fid: '#sc_sces',
	vid: 2,
	n: sc_graph.n // sc
}
