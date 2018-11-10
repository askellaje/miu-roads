from app import db


class Transactions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, index=True)
    doc_date = db.Column(db.String(), index=True)
    payer_name = db.Column(db.String(), index=True)
    recipt_name = db.Column(db.String(), index=True)
    payment_details = db.Column(db.String(), index=True)
    kevk = db.Column(db.Integer, index=True)
    id_region = db.Column(db.String(), index=True)

    def __repr__(self):
        return '<Payer: {}, amount: {}>'.format(self.payer_name, self.amount)


class Prozzoro(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lot = db.Column(db.String(), index=True)
    expected_cost = db.Column(db.Integer, index=True)
    link = db.Column(db.String(), index=True)
    organizer = db.Column(db.String(), index=True)
    winner = db.Column(db.String(), index=True)
    sum_win = db.Column(db.Integer, index=True)
    cpv = db.Column(db.String(), index=True)
    porog = db.Column(db.String(), index=True)
    id_region = db.Column(db.String(), index=True)

    def __repr__(self):
        return '<Lot: {}, cost: {}>'.format(self.lot, self.expected_cost)