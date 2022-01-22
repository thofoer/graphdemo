import cytoscape from 'cytoscape';

export const graphStyles: cytoscape.Stylesheet[] = [
    {
        selector: 'node',
        style: {
          'width': 60,
          'height': 60,
          'text-valign': 'center',        
          'color': '#000',
          'label': 'data(name)',        
        },      
      },
      {
        selector: '.blue',
        style: {
          'background-color': '#00F',
          'color': '#FFF'
        },      
      },
      {
        selector: '.red',
        style: {
          'background-color': '#F00'        
        },      
      },
      {
        selector: '.green',
        style: {
          'background-color': '#1C9'        
        },      
      },
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#000',
          'target-arrow-color': '#000',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(weight)',      
          'font-size': 16,
          'text-background-opacity': 1,
          'text-background-color': 'lightblue',
          'text-background-padding': '2',
          'text-background-shape': 'roundrectangle'
        }
      },
      {
        selector: '.edgeUnweighted',
        style: {
          'label': '', 
        }
      },
      {
        selector: '.edgeBidirectional',
        style: {
          'target-arrow-shape': 'none'
        }
      },
      {
          selector: '.edgeHighlight',
          style: {
            'width': 5,
            'line-color': '#00F',
            'target-arrow-color': '#00F',
          }
      }

];