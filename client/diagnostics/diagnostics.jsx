/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore');
var cx = require('react-addons').classSet;

var Myo = require('./myo.js');
require('./myo.experimental.js');

//Page componenets

var Header = require('./header/header.jsx');

var Controls = require('./controls/controls.jsx');
var Graphs = require('./graphs/graphs.jsx');
var Positional = require('./positional/positional.jsx');
var Status = require('./status/status.jsx');

var Events = require('./events/events.jsx');




var Diagnostics = React.createClass({
	getDefaultProps : function(){
		return {};
	},
	getInitialState : function(){
		return {
			myoId : 0

		};
	},

	onMyoChange : function(id){
		this.setState({
			myoId : id
		})
	},

	update : function(){
		this.forceUpdate()
	},

	componentWillMount: function() {
		var self = this;


		Myo.on('connected', function(){
			self.forceUpdate();
		});
		Myo.on('disconnected', function(){
			self.forceUpdate();
		});

		Myo.create(0);
		Myo.create(1);
		Myo.create(2);
		Myo.create(3);

		this.myos = Myo.myos;
	},
	componentDidMount : function(){
		var self = this;
		setTimeout(function(){
			self.myos[self.state.myoId].zeroOrientation();
		}, 500)
	},

	render : function(){
		var self = this;
		return(
			<div className='diagnostics'>

				<Header myos={this.myos} myoId={this.state.myoId} onMyoChange={this.onMyoChange}/>


				<div className='left'>
					<Status myo={this.myos[this.state.myoId]} update={this.update} />
					<Controls myo={this.myos[this.state.myoId]} />
					<Positional myo={this.myos[this.state.myoId]} />

				</div>

				<div className='right'>
					<Graphs myo={this.myos[this.state.myoId]} />

					<Events myo={this.myos[this.state.myoId]} update={this.update} />
				</div>





			</div>
		);
	}
});

/* */

module.exports = Diagnostics;