import clsx from 'clsx';
import styles from '@styles/ui/alert.module.css';



const successAlert = clsx({
    [styles.msg] : true,
    [styles.success] : true
});
const errorAlert = clsx({
    [styles.msg] : true,
    [styles.error] : true
});



export interface AlertType {
    cStatus: number,
    msg: string
}

export interface AlertVariation {
    cStatus: number,
    jsx: React.ReactNode
}

interface AlertComponentType {
    alert: AlertType,
    variations?: AlertVariation[]
}

export function Alert({ alert, variations }: AlertComponentType) {
    const status = parseInt(alert.cStatus.toString()[0]);
    const classes = (status==2) ? successAlert: errorAlert;

    if (variations==undefined) return (
        <div className={classes}>
            <p>{alert.msg}</p>
        </div>
    );

    const variation = variations.find(alertVar => (alertVar.cStatus===alert.cStatus));
    return (
        <div className={classes}>
            {variation ? 
                <>{variation.jsx}</>
            :
                <p>{alert.msg}</p>
            }
        </div>
    );
}

interface CheckIfAlertType {
    alert: AlertType|null,
    variations?: AlertVariation[],
    content: React.ReactNode
}
export function CheckIfAlert({ alert, variations, content }: CheckIfAlertType) {
    if (alert!=null && alert.cStatus/100!=2) return <Alert alert={alert} variations={variations} />;
    return <>{content}</>;
}