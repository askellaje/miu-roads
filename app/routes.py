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
    'UA-05': {'subvention': 623809700, 'ukravto': 2019168721},
    'UA-07': {'subvention': 393913500, 'ukravto': 491459146},
    'UA-12': {'subvention': 553445000, 'ukravto': 980117596},
    'UA-14': {'subvention': 557536700, 'ukravto': 585253609},
    'UA-18': {'subvention': 617157300, 'ukravto': 415970191},
    'UA-21': {'subvention': 218740300, 'ukravto': 658596948},
    'UA-23': {'subvention': 479704900, 'ukravto': 514110538},
    'UA-26': {'subvention': 278907100, 'ukravto': 421807156},
    'UA-32': {'subvention': 548968300, 'ukravto': 494217529},
    'UA-35': {'subvention': 381647300, 'ukravto': 633039365},
    'UA-09': {'subvention': 352620400, 'ukravto': 255443052},
    'UA-46': {'subvention': 583215000, 'ukravto': 1387620752},
    'UA-48': {'subvention': 287099500, 'ukravto': 559585878},
    'UA-51': {'subvention': 425698000, 'ukravto': 480025552},
    'UA-53': {'subvention': 588363200, 'ukravto': 2430148660},
    'UA-56': {'subvention': 281342500, 'ukravto': 425103454},
    'UA-59': {'subvention': 457482500, 'ukravto': 510576208},
    'UA-61': {'subvention': 315105700, 'ukravto': 1461795520},
    'UA-63': {'subvention': 656185200, 'ukravto': 2099910936},
    'UA-65': {'subvention': 319779400, 'ukravto': 333130705},
    'UA-68': {'subvention': 456533500, 'ukravto': 1192054864},
    'UA-71': {'subvention': 391451300, 'ukravto': 936223858},
    'UA-74': {'subvention': 426199400, 'ukravto': 384882767},
    'UA-77': {'subvention': 182873000, 'ukravto': 651400425}
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


PETROL = 0.2135
DIESEL = 0.1395
GAS = 0.052
ALT_FUEL = 0.162
PERCENT_2018 = 0.5
PERCENT_2019 = 0.75
UAH_EUR_2018 = 32.1429
UAH_EUR_2019 = 31.3329

REGIONS_CALC = {
    'Вінницька': 0.0568034562407884,
    'Волинська': 0.0358693496749182,
    'Дніпропетровська': 0.0503961205463511,
    'Донецька': 0.050768706451797,
    'Житомирська': 0.0561976956822459,
    'Закарпатська': 0.0199182620262989,
    'Запорізька': 0.0436814244723059,
    'Івано-Франківська': 0.0253969876552019,
    'Київ': 0.104998845873339,
    'Кіровоградська': 0.0347524023832349,
    'Луганська': 0.0321092433493889,
    'Львівська': 0.0531069454858932,
    'Миколаївська': 0.0261429789966431,
    'Одеська': 0.0387636128691028,
    'Полтавська': 0.0535757351719447,
    'Рівненська': 0.0256187526218717,
    'Сумська': 0.0416578760632874,
    'Тернопільська': 0.0286931941602912,
    'Харківська': 0.0597515352743842,
    'Херсонська': 0.0291187763745988,
    'Хмельницька': 0.0415714611197998,
    'Черкаська': 0.0356451443283901,
    'Чернівецька': 0.0166522233513229,
    'Чернігівська': 0.0388092698265998
}

# prework for the map
regions_trans = db.session.query(Transactions.id_region, Transactions.kevk,
                                 label('sum', func.sum(Transactions.amount))).group_by(Transactions.id_region,
                                                                                       Transactions.kevk).all()


def _get_spending_data(spending_type):
    spending = [{'id': i[0], 'value': round(i[2], 2)} for i in regions_trans if i[1] == spending_type]
    return spending


@app.route('/')
@app.route('/index')
def index():
    ukravto = _get_spending_data('ukravto')
    subvention = _get_spending_data('subvention')
    other = _get_spending_data('other')
    experiment = _get_spending_data('experiment')
    safety = _get_spending_data('safety')
    return render_template('index.html', map_ukr={'ukravto': ukravto,
                                                  'subvention': subvention,
                                                  'other': other,
                                                  'experiment': experiment,
                                                  'safety': safety})


@app.route('/start', methods=['POST'])
def start():
    region = request.form['region']
    page = request.form['page']
    if region and page:
        lots = Prozzoro.query.filter(Prozzoro.id_region == region)

        # fill in tables
        trans = Transactions.query.filter(Transactions.kevk == page)

        # launch timeline -> start regions is UA-05
        dates = db.session.query(Transactions.doc_date, label('sum', func.sum(Transactions.amount))).filter(
            Transactions.id_region == region).filter(Transactions.kevk == page).group_by(Transactions.doc_date).all()
        dates = [(x[0][:7], x[1]) for x in dates]
        dates = [(x, sum(map(itemgetter(1), y))) for x, y in groupby(dates, itemgetter(0))]

        # cumulative values
        cum_vals = list(accumulate([i[1] for i in dates]))

        # budget of the oblast
        budget = regions_budgets[region][page]

        return jsonify({
            'trans': [serialize_trans(t) for t in trans.all()],
            'lots': [serialize_lots(l) for l in lots.all()],
            'dates': [[{"date": d[0], "value": round(d[1], 2)} for d in dates],
                      [{"date": d[0], "value": round(c, 2), "budget": budget} for d, c in zip(dates, cum_vals)]],
            'region': regs[region],
            'budget': regions_budgets[region][page],
            'spent': round(cum_vals[-1], 2),
            'ratio': round(cum_vals[-1] * 100 / budget, 2),
            'n_lots': lots.count(),
            'n_trans': trans.count()
        })
    return jsonify({'error': 'bad'})


@app.route('/update', methods=['POST'])
def update():
    region = request.form['region']
    page = request.form['page']

    lots = Prozzoro.query.filter(Prozzoro.id_region == region)
    trans = Transactions.query.filter(Transactions.id_region == region).filter(Transactions.kevk == page)

    dates = db.session.query(Transactions.doc_date, label('sum', func.sum(Transactions.amount))).filter(
        Transactions.id_region == region).filter(Transactions.kevk == page).group_by(Transactions.doc_date).all()
    dates = [(x[0][:7], x[1]) for x in dates]
    dates = [(x, sum(map(itemgetter(1), y))) for x, y in groupby(dates, itemgetter(0))]
    # cumulative values
    cum_vals = list(accumulate([i[1] for i in dates]))

    # budget of the oblast
    budget = regions_budgets[region][page] if page in ('ukravto', 'subvention') else ''
    ratio = round(cum_vals[-1] * 100 / budget, 2) if budget else ''

    return jsonify({
        'trans': [serialize_trans(t) for t in trans.all()],
        'lots': [serialize_lots(l) for l in lots.all()],
        'dates': [[{"date": d[0], "value": round(d[1], 2), "budget": budget if budget else 0} for d in dates],
                  [{"date": d[0], "value": round(c, 2), "budget": budget if budget else 0} for d, c in zip(dates, cum_vals)]],
        'region': regs[region],
        'budget': budget,
        'spent': round(cum_vals[-1], 2),
        'ratio': ratio,
        'n_lots': lots.count(),
        'n_trans': trans.count()
    })


@app.route('/porog', methods=['POST'])
def porog():
    lots = Prozzoro.query.all()
    return jsonify({
        'lots': [[serialize_lots(l) for l in lots if l.porog == 'doporog'],
                 [serialize_lots(l) for l in lots if l.porog == 'nadporog']]
    })


@app.route('/lots/<region>')
def lots(region):
    oblast = regs[region]
    lots = Prozzoro.query.filter(Prozzoro.id_region == region).all()
    return render_template('region.html', lots=lots, oblast=oblast)


@app.route('/transactions/<region>/<page>')
def trans(region, page):
    oblast = regs[region]
    trans = Transactions.query.filter(Transactions.id_region == region).filter(Transactions.kevk == page).all()
    return render_template('transactions.html', trans=trans, oblast=oblast)


@app.route('/calculator', methods=['POST'])
def calculator():

    # 2018
    petrol_2018 = float(request.form['petrol_2018'])
    diesel_2018 = float(request.form['diesel_2018'])
    gas_2018 = float(request.form['gas_2018'])
    alt_fuel_2018 = float(request.form['alt_fuel_2018'])
    roads_total_2018_eur = round((petrol_2018 * PETROL + diesel_2018 * DIESEL + gas_2018 * GAS +
                                  alt_fuel_2018 * ALT_FUEL) * PERCENT_2018, 2)
    roads_total_2018_uah = round(roads_total_2018_eur * UAH_EUR_2018, 2)
    roads_country_60_2018 = round(roads_total_2018_uah * 0.6, 2)
    roads_country_35_2018 = round(roads_total_2018_uah * 0.35, 2)
    roads_safety_2018 = round(roads_total_2018_uah * 0.05, 2)
    regions_2018 = [round(roads_country_35_2018 * v, 2) for v in REGIONS_CALC.values()]

    # 2019
    petrol_2019 = float(request.form['petrol_2019'])
    diesel_2019 = float(request.form['diesel_2019'])
    gas_2019 = float(request.form['gas_2019'])
    alt_fuel_2019 = float(request.form['alt_fuel_2019'])
    roads_total_2019_eur = round((petrol_2019 * PETROL + diesel_2019 * DIESEL + gas_2019 * GAS +
                                  alt_fuel_2019 * ALT_FUEL) * PERCENT_2019, 2)
    roads_total_2019_uah = round(roads_total_2019_eur * UAH_EUR_2019, 2)
    roads_country_60_2019 = round(roads_total_2019_uah * 0.6, 2)
    roads_country_35_2019 = round(roads_total_2019_uah * 0.35, 2)
    roads_safety_2019 = round(roads_total_2019_uah * 0.05, 2)
    regions_2019 = [round(roads_country_35_2019 * v, 2) for v in REGIONS_CALC.values()]

    return jsonify({'roads_total_2018_eur': roads_total_2018_eur,
                    'roads_total_2019_eur': roads_total_2019_eur,
                    'roads_total_2018_uah': roads_total_2018_uah,
                    'roads_total_2019_uah': roads_total_2019_uah,
                    'roads_country_60_2018': roads_country_60_2018,
                    'roads_country_60_2019': roads_country_60_2019,
                    'roads_country_35_2018': roads_country_35_2018,
                    'roads_country_35_2019': roads_country_35_2019,
                    'roads_safety_2018': roads_safety_2018,
                    'roads_safety_2019': roads_safety_2019,
                    'regions_2018': regions_2018,
                    'regions_2019': regions_2019})
