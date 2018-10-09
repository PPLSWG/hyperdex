import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import title from 'title';
import DateInput from 'components/DateInput';
import Select from 'components/Select';
import {translate} from '../translate';
import './SwapFilters.scss';

const t = translate('swap');

class SwapFilters extends React.Component {
	state = {};

	dateToInput = React.createRef();

	filterSwap = swap => {
		const {dateFrom, dateTo, pair, type} = this.state;

		if (pair) {
			const [baseCurrency, quoteCurrency] = pair.split('/');

			if (swap.baseCurrency !== baseCurrency || swap.quoteCurrency !== quoteCurrency) {
				return false;
			}
		}

		if (type && swap.orderType !== type) {
			return false;
		}

		if (dateFrom && swap.timeStarted < dateFrom.getTime()) {
			return false;
		}

		if (dateTo && swap.timeStarted > dateTo.getTime()) {
			return false;
		}

		return true;
	}

	handleDateChange = (value, modifiers, input) => {
		this.setState({[input.props.name]: value});
	}

	handleSelectChange = field => selectedOption => {
		this.setState({[field]: selectedOption === null ? selectedOption : selectedOption.value});
	}

	render() {
		const {children, swaps} = this.props;
		const {dateFrom, dateTo} = this.state;
		const modifiers = {start: dateFrom, end: dateTo};
		const selectFilters = [
			{
				name: 'pair',
				searchable: true,
				options: _.uniqBy(swaps, swap => `${swap.baseCurrency}${swap.quoteCurrency}`).map(swap => {
					const pair = `${swap.baseCurrency}/${swap.quoteCurrency}`;

					return {
						label: pair,
						value: pair,
					};
				}),
			},
			{
				name: 'type',
				searchable: false,
				options: _.uniqBy(swaps, 'orderType').map(swap => ({
					label: title(swap.orderType),
					value: swap.orderType,
				})),
			},
		];

		return (
			<React.Fragment>
				<div className="SwapFilters">
					<div className="SwapFilters__section">
						<label>{t('filter.date')}:</label>
						<DateInput
							name="dateFrom"
							placeholder={`${t('filter.dateFrom')}...`}
							value={dateFrom}
							onDayChange={this.handleDateChange}
							dayPickerProps={{
								disabledDays: {after: dateTo},
								modifiers,
								numberOfMonths: 2,
								pagedNavigation: true,
								selectedDays: [dateFrom, {from: dateFrom, to: dateTo}],
								onDayClick: () => {
									this.dateToInput.current.getInput().focus();
								},
							}}
						/>
						{' - '}
						<DateInput
							ref={this.dateToInput}
							name="dateTo"
							placeholder={`${t('filter.dateTo')}...`}
							value={dateTo}
							onDayChange={this.handleDateChange}
							dayPickerProps={{
								disabledDays: {before: dateFrom},
								fromMonth: dateFrom,
								modifiers,
								month: dateFrom,
								numberOfMonths: 2,
								pagedNavigation: true,
								selectedDays: [dateFrom, {from: dateFrom, to: dateTo}],
							}}
						/>
					</div>
					{selectFilters.map(filter => (
						<div key={filter.name} className="SwapFilters__section">
							<label>{t(`filter.${filter.name}`)}:</label>
							<Select
								clearable
								onChange={this.handleSelectChange(filter.name)}
								options={filter.options}
								searchable={filter.searchable}
								value={this.state[filter.name]}
							/>
						</div>
					))}
				</div>
				{children(this.props.swaps.filter(swap => this.filterSwap(swap)))}
			</React.Fragment>
		);
	}
}

SwapFilters.propTypes = {
	children: PropTypes.func,
	swaps: PropTypes.arrayOf(PropTypes.object),
};

export default SwapFilters;