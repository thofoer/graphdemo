import { FC } from "react";
import { Button, Card } from "react-bootstrap";


export const MazeComp: FC = () => {

    const removeDeadends = () => {

    }

    return (
        <>
          <Card className="m-3">
            <Button onClick={removeDeadends}>Sackgassen entfernen</Button>
            </Card>
        </>
    );
}