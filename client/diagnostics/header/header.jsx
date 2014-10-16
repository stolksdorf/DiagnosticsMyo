/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = require('react-addons').classSet;

var Pips = require('../pips.jsx');

var Header = React.createClass({
	getDefaultProps : function(){
		return {
			myos : [],
			myoId : null,
			onMyoChange : function(){}
		};
	},

	render : function(){
		var self = this;

		var myos = _.map(this.props.myos, function(myo, id){
			var classes = cx({
				selected : self.props.myoId == id,
				disabled : !myo.isConnected
			})
			var path = '/assets/header/myo_icon_blue.svg';
			var onClick = self.props.onMyoChange.bind(null, id);
			if(!myo.isConnected){
				path = '/assets/header/myo_icon_white.svg';
				onClick = function(){};
			}

			return <button className={classes} onClick={onClick}>
					<img src={path} />
					<div className='myoId'>{id}</div>
				</button>
		});


		return(
			<div className='diagnostcsHeader'>
				<Pips p="..  " />

				<img className='logo' src='https://d1yjwyup50ou7g.cloudfront.net/static/e66a147/img/footer/thalmic_logo_mark.svg' />

				<div className='title'>
					<Pips p=".   " />
					Myo Diagnostics</div>

				<div className='myoControl'>
					{myos}
				</div>

			</div>
		);
	}
});

module.exports = Header;


