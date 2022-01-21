import { Button, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Graph, GraphDef } from '../../types';
import { setGraph } from '../../store/graphSlice';
import {GraphDefinition } from './GraphDefinition';

interface OwnProps {  
  modalOpen: boolean;
  hideModal: () => void;
  graphDefs: GraphDef[];
}

export const GraphDefinitionModal: React.FunctionComponent<OwnProps> = (
  { modalOpen, hideModal, graphDefs }
) => {

  const dispatch = useDispatch();

  const handleSetGraph = (graph: Graph) => {
    dispatch(setGraph(graph));
    hideModal();
  }

  return (
    <Modal size="lg" show={modalOpen} onHide={hideModal}>
      <Modal.Header closeButton>
        <Modal.Title>Graph definieren</Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <GraphDefinition onSetGraph={handleSetGraph} graphDefs={graphDefs}/>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={hideModal}>
          Abbruch
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
