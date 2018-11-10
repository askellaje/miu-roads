from itertools import groupby, accumulate
from operator import itemgetter

from flask import render_template
from flask import request
from flask import jsonify

from sqlalchemy import func
from sqlalchemy.sql import label

from app import app
from app import db
from app.models import Transactions, Prozzoro

regs = {'UA-05': 'Вінницька',
		'UA-07': 'Волинська',
		'UA-12': 'Дніпропетровська',
		'UA-14': 'Донецька',
		'UA-18': 'Житомирська',
		'UA-21': 'Закарпатська',
		'UA-23': 'Запорізька',
		'UA-26': 'Івано-Франківська',
		'UA-32': 'Київська',
		'UA-35': 'Кіровоградська',
		'UA-09': 'Луганська',
		'UA-46': 'Львівська',
		'UA-48': 'Миколаївська',
		'UA-51': 'Одеська',
		'UA-53': 'Полтавська',
		'UA-56': 'Рівненська',
		'UA-59': 'Сумська',
		'UA-61': 'Тернопільська',
		'UA-63': 'Харківська',
		'UA-65': 'Херсонська',
		'UA-68': 'Хмельницька',
		'UA-71': 'Черкаська',
		'UA-77': 'Чернівецька',
		'UA-74': 'Чернігівська'}

regions_budgets = {
	'UA-05': {'subvention': 623809700, 'ukravto': 1069388057},
	'UA-07': {'subvention': 393913500, 'ukravto': 675280286},
	'UA-09': {'subvention': 352620400, 'ukravto': 604492114},
	'UA-12': {'subvention': 553445000, 'ukravto': 948762857},
	'UA-14': {'subvention': 557536700, 'ukravto': 955777200},
	'UA-18': {'subvention': 617157300, 'ukravto': 1057983943},
	'UA-21': {'subvention': 218740300, 'ukravto': 374983371},
	'UA-23': {'subvention': 479704900, 'ukravto': 822351257},
	'UA-26': {'subvention': 278907100, 'ukravto': 478126457},
	'UA-32': {'subvention': 548968300, 'ukravto': 941088514},
	'UA-35': {'subvention': 381647300, 'ukravto': 654252514},
	'UA-46': {'subvention': 583215000, 'ukravto': 999797143},
	'UA-48': {'subvention': 287099500, 'ukravto': 492170571},
	'UA-51': {'subvention': 425698000, 'ukravto': 729768000},
	'UA-53': {'subvention': 588363200, 'ukravto': 1008622629},
	'UA-56': {'subvention': 281342500, 'ukravto': 482301429},
	'UA-59': {'subvention': 457482500, 'ukravto': 784255714},
	'UA-61': {'subvention': 315105700, 'ukravto': 540181200},
	'UA-63': {'subvention': 656185200, 'ukravto': 1124888914},
	'UA-65': {'subvention': 319779400, 'ukravto': 548193257},
	'UA-68': {'subvention': 456533500, 'ukravto': 782628857},
	'UA-71': {'subvention': 391451300, 'ukravto': 671059371},
	'UA-74': {'subvention': 426199400, 'ukravto': 730627543},
	'UA-77': {'subvention': 182873000, 'ukravto': 313496571}
 }

def serialize_trans(s):
	return {
		'id': s.id,
		'amount': s.amount,
		'doc_date': s.doc_date,
		'payer_name': s.payer_name,
		'recipt_name': s.recipt_name,
		'payment_details': s.payment_details,
		'kevk': s.kevk,
		'id_region': s.id_region,
	}

def serialize_lots(s):
	return {
		'id': s.id,
		'lot': s.lot,
		'expected_cost': s.expected_cost,
		'link': s.link,
		'organizer': s.organizer,
		'winner': s.winner,
		'sum_win': '' if s.sum_win is None else s.sum_win,
		'cpv': s.cpv,
		'porog': s.porog,
		'id_region': s.id_region,
		'region_name': regs[s.id_region]
	}

# prework for the map
regions_trans = db.session.query(Transactions.id_region, Transactions.kevk, label('sum', func.sum(Transactions.amount))).group_by(Transactions.id_region, Transactions.kevk).all()

ukravto = [(i[0], round(i[2], 2)) for i in regions_trans if i[1] == 2281]
ukravto = [{"id": t[0], "value": round((t[1] * 100)/regions_budgets[t[0]]['ukravto'], 2)} for t in ukravto]

subvention = [(i[0], round(i[2], 2)) for i in regions_trans if i[1] != 2281]
subvention = [(x,sum(map(itemgetter(1),y))) for x,y in groupby(subvention, itemgetter(0))]
subvention = [{"id": t[0], "value": round((t[1] * 100)/regions_budgets[t[0]]['subvention'], 2)} for t in subvention]

@app.route('/')
@app.route('/index')
def index():
	return render_template('index.html', map_ukr={'map': [ukravto, subvention]})

@app.route('/start', methods=['POST'])
def start():
	region = request.form['region']
	page = request.form['page']
	if region and page:
		lots = Prozzoro.query.filter(Prozzoro.id_region == region)
		# fill in tables
		trans = Transactions.query.filter(Transactions.id_region == region).filter(Transactions.kevk == 2281)

		# launch timeline -> start regions is UA-05
		dates = db.session.query(Transactions.doc_date, label('sum', func.sum(Transactions.amount))).filter(Transactions.id_region == region).filter(Transactions.kevk == 2281).group_by(Transactions.doc_date).all()
		dates = [(x[0][:7],x[1]) for x in dates]
		dates = [(x,sum(map(itemgetter(1),y))) for x,y in groupby(dates, itemgetter(0))]
		# cumulative values
		cum_vals = list(accumulate([i[1] for i in dates]))

		# budget of the oblast
		budget = regions_budgets[region][page]

		return jsonify({
					'trans' : [serialize_trans(t) for t in trans.all()],
					'lots': [serialize_lots(l) for l in lots.all()],
					'dates': [[{"date": d[0], "value": round(d[1], 2)} for d in dates], [{"date": d[0], "value": round(c, 2), "budget": budget} for d,c in zip(dates, cum_vals)]],
					'region': regs[region],
					'budget': regions_budgets[region][page],
					'spent': round(cum_vals[-1], 2),
					'ratio': round(cum_vals[-1]*100/budget, 2),
					'n_lots': lots.count(),
					'n_trans': trans.count()
				})
	return jsonify({'error' : 'bad'})

@app.route('/update', methods=['POST'])
def update():
	region = request.form['region']
	page = request.form['page']
	lots = Prozzoro.query.filter(Prozzoro.id_region == region)

	# budget of the oblast
	budget = regions_budgets[region][page]
	
	if page == 'ukravto':
		trans = Transactions.query.filter(Transactions.id_region == region).filter(Transactions.kevk == 2281)
		
		dates = db.session.query(Transactions.doc_date, label('sum', func.sum(Transactions.amount))).filter(Transactions.id_region == region).filter(Transactions.kevk == 2281).group_by(Transactions.doc_date).all()
		dates = [(x[0][:7],x[1]) for x in dates]
		dates = [(x,sum(map(itemgetter(1),y))) for x,y in groupby(dates, itemgetter(0))]
		# cumulative values
		cum_vals = list(accumulate([i[1] for i in dates]))

		# budget of the oblast
		budget = regions_budgets[region][page]

		return jsonify({
				'trans' : [serialize_trans(t) for t in trans.all()], 
				'lots': [serialize_lots(l) for l in lots.all()],
				'dates': [[{"date": d[0], "value": round(d[1], 2), "budget": budget} for d in dates], [{"date": d[0], "value": round(c, 2), "budget": budget} for d,c in zip(dates, cum_vals)]],
				'region': regs[region],
				'budget': regions_budgets[region][page],
				'spent': round(cum_vals[-1], 2),
				'ratio': round(cum_vals[-1]*100/budget, 2),
				'n_lots': lots.count(),
				'n_trans': trans.count()
			})
	else:
		trans = Transactions.query.filter(Transactions.id_region == region).filter(Transactions.kevk != 2281)
		
		dates = db.session.query(Transactions.doc_date, label('sum', func.sum(Transactions.amount))).filter(Transactions.id_region == region).filter(Transactions.kevk != 2281).group_by(Transactions.doc_date).all()
		
		dates = [(x[0][:7],x[1]) for x in dates]
		dates = [(x,sum(map(itemgetter(1),y))) for x,y in groupby(dates, itemgetter(0))]
		# cumulative values
		cum_vals = list(accumulate([i[1] for i in dates]))

		# budget of the oblast
		budget = regions_budgets[region][page]

		return jsonify({
				'trans' : [serialize_trans(t) for t in trans.all()], 
				'lots': [serialize_lots(l) for l in lots.all()],
				'dates': [[{"date": d[0], "value": round(d[1], 2), "budget": budget} for d in dates], [{"date": d[0], "value": round(c, 2), "budget": budget} for d,c in zip(dates, cum_vals)]],
				'region': regs[region],
				'budget': regions_budgets[region][page],
				'spent': round(cum_vals[-1], 2),
				'ratio': round(cum_vals[-1]*100/budget, 2),
				'n_lots': lots.count(),
				'n_trans': trans.count()
			})

	return jsonify({'error' : 'bad'})


@app.route('/porog', methods=['POST'])
def porog():
	lots = Prozzoro.query.all()
	if True:
		return jsonify({
				'lots': [[serialize_lots(l) for l in lots if l.porog == 'допороги'], [serialize_lots(l) for l in lots if l.porog == 'надпороги']]
			})
	return jsonify({'error' : 'bad'})


@app.route('/lots/<region>')
def lots(region):
	oblast = regs[region]
	lots = Prozzoro.query.filter(Prozzoro.id_region == region).all()
	return render_template('region.html', lots=lots, oblast=oblast)


@app.route('/transactions/<region>/<page>')
def trans(region, page):
	oblast = regs[region]
	if page == 'subvention':
		trans = Transactions.query.filter(Transactions.id_region == region).filter(Transactions.kevk != 2281).all()
		return render_template('transactions.html', trans=trans, oblast=oblast)
	trans = Transactions.query.filter(Transactions.id_region == region).filter(Transactions.kevk == 2281).all()
	return render_template('transactions.html', trans=trans, oblast=oblast)