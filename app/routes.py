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

regs = {'Вінницька': 'UA-05',
		'Волинська': 'UA-07',
		'Дніпропетровська': 'UA-12',
		'Донецька': 'UA-14',
		'Житомирська': 'UA-18',
		'Закарпатська': 'UA-21',
		'Запорізька': 'UA-23',
		'Івано-Франківська': 'UA-26',
		'Київська': 'UA-32',
		'Кіровоградська': 'UA-35',
		'Луганська': 'UA-09',
		'Львівська': 'UA-46',
		'Миколаївська': 'UA-48',
		'Одеська': 'UA-51',
		'Полтавська': 'UA-53',
		'Рівненська': 'UA-56',
		'Сумська': 'UA-59',
		'Тернопільська': 'UA-61',
		'Харківська': 'UA-63',
		'Херсонська': 'UA-65',
		'Хмельницька': 'UA-68',
		'Черкаська': 'UA-71',
		'Чернівецька': 'UA-77',
		'Чернігівська': 'UA-74'}

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
		'sum_win': s.sum_win,
		'cpv': s.cpv,
		'porog': s.porog,
		'id_region': s.id_region
	}

@app.route('/')
@app.route('/index')
def index():
	# fill in tables
	trans = Transactions.query.filter(Transactions.id_region == "UA-05").filter(Transactions.kevk == 2281).all()
	lots = Prozzoro.query.filter(Transactions.id_region == "UA-05").filter(Transactions.kevk == 2281).all()

	# launch map
	regions_trans = db.session.query(Transactions.id_region, label('sum', func.sum(Transactions.amount))).filter(Transactions.kevk == 2281).group_by(Transactions.id_region).all()

	# launch timeline -> start regions is UA-05
	dates = db.session.query(Transactions.doc_date, label('sum', func.sum(Transactions.amount))).filter(Transactions.id_region == 'UA-05').filter(Transactions.kevk == 2281).group_by(Transactions.doc_date).all()
	dates = [(x[0][:7],x[1]) for x in dates]
	dates = [(x,sum(map(itemgetter(1),y))) for x,y in groupby(dates, itemgetter(0))]
	# cumulative values
	cum_vals = list(accumulate([i[1] for i in dates]))

	return render_template(
			'index.html', 
			trans=trans, 
			lots=lots, 
			regions=regs, 
			dates={'dates': [[{"date": d[0], "value": round(d[1], 2)} for d in dates], [{"date": d[0], "value": round(c, 2)} for d,c in zip(dates, cum_vals)]]}, 
			map_ukr={'map': [{"id": t[0], "value": round(t[1], 2)} for t in regions_trans]}
		)

@app.route('/update', methods=['POST'])
def update():
	region = request.form['region']
	page = request.form['page']
	lots = Prozzoro.query.filter(Prozzoro.id_region == region).all()
	if page == 'ukravto':
		trans = Transactions.query.filter(Transactions.id_region == region).filter(Transactions.kevk == 2281).all()
		
		regions_trans = db.session.query(Transactions.id_region, label('sum', func.sum(Transactions.amount))).filter(Transactions.kevk == 2281).group_by(Transactions.id_region).all()
		
		dates = db.session.query(Transactions.doc_date, label('sum', func.sum(Transactions.amount))).filter(Transactions.id_region == region).filter(Transactions.kevk == 2281).group_by(Transactions.doc_date).all()
		dates = [(x[0][:7],x[1]) for x in dates]
		dates = [(x,sum(map(itemgetter(1),y))) for x,y in groupby(dates, itemgetter(0))]
		# cumulative values
		cum_vals = list(accumulate([i[1] for i in dates]))

		return jsonify({
				'trans' : [serialize_trans(t) for t in trans], 
				'lots': [serialize_lots(l) for l in lots], 
				'map': [{"id": t[0], "value": round(t[1])} for t in regions_trans], 
				'dates': [[{"date": d[0], "value": round(d[1], 2)} for d in dates], [{"date": d[0], "value": round(c, 2)} for d,c in zip(dates, cum_vals)]]
			})
	else:
		trans = Transactions.query.filter(Transactions.id_region == region).filter(Transactions.kevk != 2281).all()
		
		regions_trans = db.session.query(Transactions.id_region, label('sum', func.sum(Transactions.amount))).filter(Transactions.kevk != 2281).group_by(Transactions.id_region).all()
		
		dates = db.session.query(Transactions.doc_date, label('sum', func.sum(Transactions.amount))).filter(Transactions.id_region == region).filter(Transactions.kevk != 2281).group_by(Transactions.doc_date).all()
		
		dates = [(x[0][:7],x[1]) for x in dates]
		dates = [(x,sum(map(itemgetter(1),y))) for x,y in groupby(dates, itemgetter(0))]
		# cumulative values
		cum_vals = list(accumulate([i[1] for i in dates]))

		return jsonify({
				'trans' : [serialize_trans(t) for t in trans], 
				'lots': [serialize_lots(l) for l in lots], 
				'map': [{"id": t[0], "value": round(t[1])} for t in regions_trans], 
				'dates': [[{"date": d[0], "value": round(d[1], 2)} for d in dates], [{"date": d[0], "value": round(c, 2)} for d,c in zip(dates, cum_vals)]]
			})

	return jsonify({'error' : 'bad'})