import React from 'react';

import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Line } from "react-chartjs-2";

Chart.register(CategoryScale);

export const options = {
    plugins: {
        title: {
            display: true,
            text: "Historique de votre électrocardiogramme"
        },
        legend: {
            display: false
        }
    }
};

class History extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            measures: [],
            time: []
        }
    }

    componentDidMount() {
        this.props.socket.on("set:data", data => {
            const tableauHr = data.map((element) => element.hr);
            const tableauTime = data.map((element) => element.date);

            this.setState({
                measures: tableauHr,
                time: tableauTime
            })
            console.log(this.state.measures, this.state.time)
        })
    }

    render() {
        let chartData = {
            labels: this.state.time.map((data) => data),
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

export default History;
