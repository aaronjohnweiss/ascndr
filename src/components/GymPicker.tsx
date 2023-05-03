import {Form} from "react-bootstrap";
import React, {useEffect} from "react";


export const GymPicker = ({gyms, gymId, onChange}) => {
    useEffect(() => {
        if (!gymId && gyms && gyms.length > 0) {
            onChange(gyms[0].key)
        }
    }, [gyms, gymId]);

    return (
        <Form.Control as='select' defaultValue={gymId}
                      onChange={evt => onChange(evt.target.value)}>
            {
                gyms.map((gym, idx) =>
                    <option key={idx} value={gym.key} className="text-truncate">
                        {gym.value.name + " - " + gym.value.location}
                    </option>)
            }
        </Form.Control>
    );
}