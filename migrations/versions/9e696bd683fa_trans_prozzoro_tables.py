"""trans, prozzoro tables

Revision ID: 9e696bd683fa
Revises: 
Create Date: 2018-08-29 16:29:11.742675

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9e696bd683fa'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('prozzoro',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('lot', sa.String(), nullable=True),
    sa.Column('expected_cost', sa.Numeric(precision=1), nullable=True),
    sa.Column('link', sa.String(), nullable=True),
    sa.Column('organizer', sa.String(), nullable=True),
    sa.Column('winner', sa.String(), nullable=True),
    sa.Column('sum_win', sa.Numeric(precision=1), nullable=True),
    sa.Column('cpv', sa.String(), nullable=True),
    sa.Column('porog', sa.String(), nullable=True),
    sa.Column('id_region', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_prozzoro_cpv'), 'prozzoro', ['cpv'], unique=False)
    op.create_index(op.f('ix_prozzoro_expected_cost'), 'prozzoro', ['expected_cost'], unique=False)
    op.create_index(op.f('ix_prozzoro_id_region'), 'prozzoro', ['id_region'], unique=False)
    op.create_index(op.f('ix_prozzoro_link'), 'prozzoro', ['link'], unique=False)
    op.create_index(op.f('ix_prozzoro_lot'), 'prozzoro', ['lot'], unique=False)
    op.create_index(op.f('ix_prozzoro_organizer'), 'prozzoro', ['organizer'], unique=False)
    op.create_index(op.f('ix_prozzoro_porog'), 'prozzoro', ['porog'], unique=False)
    op.create_index(op.f('ix_prozzoro_sum_win'), 'prozzoro', ['sum_win'], unique=False)
    op.create_index(op.f('ix_prozzoro_winner'), 'prozzoro', ['winner'], unique=False)
    op.create_table('transactions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('amount', sa.Numeric(precision=1), nullable=True),
    sa.Column('doc_date', sa.String(), nullable=True),
    sa.Column('payer_name', sa.String(), nullable=True),
    sa.Column('recipt_name', sa.String(), nullable=True),
    sa.Column('payment_details', sa.String(), nullable=True),
    sa.Column('kevk', sa.Integer(), nullable=True),
    sa.Column('id_region', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transactions_amount'), 'transactions', ['amount'], unique=False)
    op.create_index(op.f('ix_transactions_doc_date'), 'transactions', ['doc_date'], unique=False)
    op.create_index(op.f('ix_transactions_id_region'), 'transactions', ['id_region'], unique=False)
    op.create_index(op.f('ix_transactions_kevk'), 'transactions', ['kevk'], unique=False)
    op.create_index(op.f('ix_transactions_payer_name'), 'transactions', ['payer_name'], unique=False)
    op.create_index(op.f('ix_transactions_payment_details'), 'transactions', ['payment_details'], unique=False)
    op.create_index(op.f('ix_transactions_recipt_name'), 'transactions', ['recipt_name'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_transactions_recipt_name'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_payment_details'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_payer_name'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_kevk'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_id_region'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_doc_date'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_amount'), table_name='transactions')
    op.drop_table('transactions')
    op.drop_index(op.f('ix_prozzoro_winner'), table_name='prozzoro')
    op.drop_index(op.f('ix_prozzoro_sum_win'), table_name='prozzoro')
    op.drop_index(op.f('ix_prozzoro_porog'), table_name='prozzoro')
    op.drop_index(op.f('ix_prozzoro_organizer'), table_name='prozzoro')
    op.drop_index(op.f('ix_prozzoro_lot'), table_name='prozzoro')
    op.drop_index(op.f('ix_prozzoro_link'), table_name='prozzoro')
    op.drop_index(op.f('ix_prozzoro_id_region'), table_name='prozzoro')
    op.drop_index(op.f('ix_prozzoro_expected_cost'), table_name='prozzoro')
    op.drop_index(op.f('ix_prozzoro_cpv'), table_name='prozzoro')
    op.drop_table('prozzoro')
    # ### end Alembic commands ###
