const templateInstanceToClassInstanceMap = new WeakMap();

class MonitorWidget {

    constructor() {
        _.extend(this, {
            graphElements: [],
            dataSets: [],
            graphWidth: 120,
            dataSetMaxCount: 60,
            elementsCount: 0,
            minScale: 0
        });
    }

    initDataSet(dataSet) {
        this.dataSets[dataSet] = [];
        this.graphElements[dataSet] = [];
    }

    updateGraph() {
        for (const dataSet in this.dataSets) {
            if (this.graphElements[dataSet].length === 0) return;
            let max = Math.max(...this.dataSets[dataSet]);
            if (max < this.minScale) max = this.minScale;

            this.dataSets[dataSet].forEach((value, id) => this.updateGraphElement(dataSet, value, id, max));
        }
    }

    updateGraphElement(dataSet, value, id, max) {
        this.graphElements[dataSet][id].style.height = Math.round(value / max * 30) + 'px';
    }


    updateValues(...args) {
        if (this.dataSets.length === 0) return;
        let dataSet = 0;

        // arguments[@@iterator] is not available in FF<46
        for (const value of args) {
            if (value !== undefined && value !== null) {
                this.dataSets[dataSet].unshift(value);
                if (this.dataSets[dataSet].length > this.elementsCount) {
                    this.dataSets[dataSet].pop();
                }
                this.updateGraph();
            }
            dataSet++;
        }
    }
}


Template.monitorWidget.helpers({
    // This helper is invoked to pass the reactively changed values to the MonitorWidget instance.
    updateGraph: () => {
        const monitorWidget = templateInstanceToClassInstanceMap.get(Template.instance());
        const template = Template.instance();
        const data = template.data;

        if (monitorWidget) {
            monitorWidget.updateValues(data.firstDataSource, data.secondDataSource);
        }
    }
});

Template.monitorWidget.onRendered(function monitorWidgetRendered() {
    const graphElement = this.$('#graph');
    const monitorWidget = new MonitorWidget();

    const elementsWidth = monitorWidget.graphWidth / monitorWidget.dataSetMaxCount;
    monitorWidget.elementsCount = monitorWidget.graphWidth / elementsWidth;
    monitorWidget.minScale = this.data.minScale;

    function addDataSet(id) {
        const position = id === 0 ? 'bottom:4px;' : 'top:25px;';
        const color = id === 0 ? '#0f0' : '#f08';
        let right = 4;
        monitorWidget.initDataSet(id);
        let element;
        for (let i = 0; i < monitorWidget.elementsCount; i++) {
            element = document.createElement('div');
            element.style.cssText = `opacity:0.8;right:${right}px;${position}height:0px;width:${elementsWidth}px;background-color:${color};position:absolute;`;
            graphElement.append(element);
            right += elementsWidth;
            monitorWidget.graphElements[id].push(element);
        }
    }

    if (this.data.firstDataSource !== undefined) {
        addDataSet(0);
    }
    if (this.data.secondDataSource !== undefined) {
        addDataSet(1);
    }

    // Assign the MonitorWidget instance to this template instance.
    templateInstanceToClassInstanceMap.set(Template.instance(), monitorWidget);
});
