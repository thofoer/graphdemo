import { Button, Modal } from "react-bootstrap";
import { Graph, GraphDef} from '../../types';
import {GraphDefinition } from './GraphDefinition';

interface OwnProps {  
  modalOpen: boolean;
  hideModal: () => void;
  graphDefs: GraphDef[];
  onSetGraph: (graph: Graph) => void;
}

export const GraphDefinitionModal: React.FunctionComponent<OwnProps> = (
  props
) => {
  const { modalOpen, hideModal, onSetGraph, graphDefs } = props;
  return (
    <Modal size="lg" show={modalOpen} onHide={hideModal}>
      <Modal.Header closeButton>
        <Modal.Title>Graph definieren</Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <GraphDefinition onSetGraph={onSetGraph} graphDefs={graphDefs}/>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={hideModal}>
          Abbruch
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
