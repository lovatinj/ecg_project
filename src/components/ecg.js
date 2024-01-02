import React from 'react';

import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Line } from "react-chartjs-2";

/*import PowerChart from './power-chart';*/

Chart.register(CategoryScale);

export const options = {
    plugins: {
        title: {
            display: true,
            text: "Electrocardiogramme"
        },
        legend: {
            display: false
        }
    }
};

class PowerChartContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            measures: []
        }
    }

    componentDidMount() {
        this.props.socket.on("ecg:value", data => this._updateMeasures(data));
    }

    _updateMeasures = (data) => {
        if(this.state.measures.length == 50){
            var shift_array = this.state.measures;
            shift_array.shift();
            this.setState({measures: shift_array});
            this.setState(prevState => ({
                measures: [...prevState.measures, data]
            }))
        }else{
            this.setState(prevState => ({
                measures: [...prevState.measures, data]
            }))
        }

        
    }

    render() {
        let chartData = {
            labels: this.state.measures.map((data) => {
                const date = new Date();
                return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            }),
            /*labels: [],*/
            datasets: [{
                label: "Temps",
                //data: this.state.measures.map((data) => data.value),
                data: this.state.measures.map((data) => data),
                fill: false,
                borderColor: "black",
                pointRadius: 0,
                borderWidth: 2,
                tension: 0.1
            }]
        };

        return (
            <div>
                <Line data={chartData} options={options} />
            </div>
        )
    }
}

export default PowerChartContainer;
