// TODO: define alert, needs all info needed for gropius issue creation

export interface SloAlert {
    alertName: string; // recommended: alarm{alarmName}-{alertTime}-{alertDate} (e.g. "test-prog-alarm-15:08:44-21/06/2021" )
    alertDescription: string;
    alertTime: number; // number value of Date.parse function

    sloId: string; // SLO to which the alert belongs
    sloName: string;

    triggeringTargetName: string; // name of the component that triggered the alert

    gropiusProjectId: string;
    gropiusComponentId: string;
}
