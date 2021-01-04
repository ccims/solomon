import { useHistory, useParams } from "react-router-dom";
import { Box, Button, Card, Checkbox, Container, FormControl, InputLabel, List, ListItem, ListItemIcon, ListItemText, ListSubheader, makeStyles, MenuItem, Select, TextField } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { fetchRule, postRule, addRule, fetchTargets, fetchGropiusProjects } from "../api";
import SlaRule, { FunctionOptions, MetricOptions, OperatorOptions, PresetOptions } from "../models/sla-rule.model";
import { Formik, useField } from "formik";

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export default function RuleEditPage() {

    let { id } = useParams<{ id: string }>();

    const [sla, setSla] = useState<SlaRule>();
    const [targets, setTarget] = useState<string[]>();
    const [gropiusProjects, setGropiusProjects] = useState<any[]>();
    const router = useHistory();
    const classes = useStyles();

    useEffect(() => {
        fetchTargets().then(res => setTarget(res));
        fetchGropiusProjects().then(res => setGropiusProjects(res));
        if (id) {
            fetchRule(id).then(res => setSla(res));
        } else {
            setSla({
                name: "",
                description: "",
                duration: "",
                preset: PresetOptions.AVAILABILITY,
                gropiusTargets: {},
                function: FunctionOptions.AVG_OVER_TIME,
                metric: MetricOptions.PROBE_SUCCESS,
                operator: OperatorOptions.SMALLER_THEN,
                value: 1,
            })
        }
    }, [id])

    function updateRule() {
        console.log(sla);
        if (id) {
            postRule(sla).then(res => console.log("Post", res));
        } else {
            addRule(sla).then(res => console.log("Add", res));
        }
        router.push("/")
    }

    function onSelectPreset(preset: string) {
        switch (preset) {
            case PresetOptions.AVAILABILITY:
                setSla(Object.assign({}, sla, {
                        preset: preset,
                        metric: MetricOptions.PROBE_SUCCESS,
                        operator: OperatorOptions.SMALLER_THEN,
                        function: FunctionOptions.AVG_OVER_TIME
                    }
                ));
                break;
            case PresetOptions.RESPONSE_TIME:
                setSla(Object.assign({}, sla, {
                        preset: preset,
                        metric: MetricOptions.RESPONSE_TIME,
                        operator: OperatorOptions.GREATER_THEN,
                        function: FunctionOptions.AVG_OVER_TIME
                    }
                ));
                break;
            case PresetOptions.CUSTOM:
                setSla(Object.assign({}, sla, {
                        preset: preset,
                        metric: undefined,
                        operator: undefined,
                        function: undefined
                    }
                ));
                break;
            default:
                break;
        } 
    }

    function durationInput() {
        return <TextField onChange={ (event) => setSla(Object.assign({}, sla, { duration: event.target.value })) } value={sla?.duration ?? ""} variant="outlined" fullWidth id="duration" label="duration"></TextField>
    }

    function valueInput() {
        return <TextField onChange={ (event) => setSla(Object.assign({}, sla, { value: event.target.value })) } value={sla?.value ?? ""} variant="outlined" fullWidth id="value" label="value" type="number"></TextField>

    }

    function availabilityInputs() {
        return <React.Fragment>
            { durationInput() }
            { valueInput() }
        </React.Fragment>
    }
    
    function responseTimeInput() {
        return <React.Fragment>
            { durationInput() }
            { valueInput() }
        </React.Fragment>
    }

    function customInputs() {
        return <React.Fragment>
            <FormControl fullWidth variant="outlined">
                <InputLabel>Metric</InputLabel>
                <Select variant="outlined" fullWidth onChange={ (event) => setSla(Object.assign({}, sla, { metric: event.target.value })) } value={sla?.metric ?? ""} id="metric" label="metric">
                    { Object.values(MetricOptions).map(value => <MenuItem key={value} value={value}>{ value }</MenuItem> ) }
                </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined">
                <InputLabel>Operator</InputLabel>
                <Select variant="outlined" fullWidth onChange={ (event) => setSla(Object.assign({}, sla, { operator: event.target.value })) } value={sla?.operator ?? ""} id="operator" label="operator">
                    { Object.values(OperatorOptions).map(value => <MenuItem key={value} value={value}>{ value }</MenuItem> ) }
                </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined">
                <InputLabel>Function</InputLabel>
                <Select variant="outlined" fullWidth onChange={ (event) => setSla(Object.assign({}, sla, { function: event.target.value })) } value={sla?.function ?? ""} id="function" label="function">
                    { Object.values(FunctionOptions).map(value => <MenuItem key={value} value={value}>{ value }</MenuItem> ) }
                </Select>
            </FormControl>
            { durationInput() }
            { valueInput() }
        </React.Fragment>
    }

    function gropiusProjectsInput() {
        return <FormControl fullWidth variant="outlined">
            <InputLabel>Gropius Project</InputLabel>
            <Select variant="outlined" fullWidth onChange={ (event) => setSla(Object.assign({}, sla, { gropiusProjectId: event.target.value })) } value={sla?.gropiusProjectId ?? ""} id="project" label="project">
                { gropiusProjects?.map((project: any) => <MenuItem key={project.node.id} value={project.node.id}>{ project.node.name }</MenuItem> ) }
            </Select>
        </FormControl>
    }

    function gropiusComponentInput() {
        const selectedProject = gropiusProjects?.find(project => project.node.id === sla?.gropiusProjectId);

        function addOrRemoveId(id: string) {
            if (id in sla?.gropiusTargets) {
                const targets = sla.gropiusTargets ?? new Map();
                delete targets[id];
                setSla(Object.assign({}, sla, { gropiusTargets: targets }));
            } else {
                const targets = sla.gropiusTargets ?? new Map();
                targets[id] = undefined;
                setSla(Object.assign({}, sla, { gropiusTargets: targets }));
            }
        }

        return <List subheader={ <ListSubheader>Targets</ListSubheader> }>
            { selectedProject?.node.components?.edges?.map((component: any) => <ListItem key={component.node.id}>
                <ListItemIcon>
                    <Checkbox onChange={ () => addOrRemoveId(component.node.id) } checked={ component.node.id in sla?.gropiusTargets }></Checkbox>
                </ListItemIcon>
                <ListItemText primary={component.node.name}/>
            </ListItem>) }
        </List>
    }

    function assignPrometheusTargetInput() {

        function assignService(target: string, service) {
            const targets = sla.gropiusTargets;
            targets[target] = service;
            setSla(Object.assign({}, sla, { gropiusTargets: targets }))
        }
        
        
        const selectedProject = gropiusProjects?.find(project => project.node.id === sla?.gropiusProjectId);
        return Object.keys(sla?.gropiusTargets ?? []).map(id => {
            const component = selectedProject?.node.components?.edges?.find((component: any) => component.node.id === id);
            if (component) {
                return <TextField onChange={ (event) => assignService(id, event.target.value) } value={sla?.gropiusTargets[id] ?? ""} variant="outlined" fullWidth id="service" label={`Assign Service for ${ component.node.name }`}></TextField>
 
                // return <FormControl key={id} fullWidth variant="outlined">
                //     <InputLabel>Assign Service for { component.node.name }</InputLabel>
                //     <Select variant="outlined" fullWidth onChange={ (event) => assignService(id, event.target.value) } value={ sla.gropiusTargets[id] } id="prometheusTarget" label="prometheusTarget">
                //         { targets?.map(value => (<MenuItem key={value} value={value}>
                //             <ListItemText primary={value}></ListItemText>
                //         </MenuItem>) ) }
                //     </Select>
                // </FormControl>
            } else {
                <React.Fragment></React.Fragment>
            }
        })
    }

    let presetInput;
    switch (sla?.preset) {
        case PresetOptions.AVAILABILITY:
            presetInput = availabilityInputs();
            break;
        case PresetOptions.RESPONSE_TIME:
            presetInput = responseTimeInput();
            break;
        case PresetOptions.CUSTOM:
            presetInput = customInputs();
            break;
        default:
            break;
    }

    return (
        <Container>
            <Card>
                <Box p={2}>
                    <Box p={2}>
                    <h3>Edit SLA Rule {sla?.name}</h3>
                    </Box>
                    <form className={ classes.root }>
                        {/* TODO: Validation */}
                        <TextField onChange={ (event) => setSla(Object.assign({}, sla, { name: event.target.value })) } value={sla?.name ?? ""} variant="outlined" fullWidth id="name" label="name"></TextField>
                        <TextField onChange={ (event) => setSla(Object.assign({}, sla, { description: event.target.value })) } value={sla?.description ?? ""} variant="outlined" fullWidth id="description" label="description" multiline></TextField>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>SLA  Presets</InputLabel>
                            <Select 
                                variant="outlined"
                                fullWidth
                                onChange={ (event) => onSelectPreset(event.target.value as string) }
                                value={sla?.preset ?? ""}
                                id="preset"
                                label="preset">
                                { Object.values(PresetOptions).map(value => <MenuItem key={value} value={value}>{ value }</MenuItem> ) }
                            </Select>
                        </FormControl>
                        { presetInput }
                        { gropiusProjectsInput() }
                        { gropiusComponentInput() }
                        { assignPrometheusTargetInput() }
                        <Button variant="contained" color="secondary" onClick={ updateRule }>Save</Button>
                    </form>
                </Box>
            </Card>
        </Container>
    );
}
