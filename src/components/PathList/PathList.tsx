import { FC } from "react";
import { Card, ListGroup, ListGroupItem } from "react-bootstrap";
import { Path } from "../../types";

interface OwnProps {
    paths: Path[];
}

export const PathList: FC<OwnProps> = ({paths}) => {

    return (
        <Card className="m-3">
            <Card.Header>Alle Pfade ({paths.length})</Card.Header>
            <Card.Body>
            <ListGroup style={{overflow: "auto", maxHeight: "500px"}}>
                { (paths.length < 20 ? paths : paths.slice(0, 20)).map((p) => (
                    <ListGroupItem
                        as="li"
                        key={p.strRep()}                        
                        action
                    >
                        {p.strRep()}
                    </ListGroupItem>
                ))}
                {(paths.length>20) &&  
                    <ListGroupItem
                        as="li"
                        key="ausgeblendet"
                        action
                    >
                        <i>{paths.length-20} weitere...</i>
                    </ListGroupItem>
                        
                }
            </ListGroup>
            </Card.Body>
        </Card>
    );
}