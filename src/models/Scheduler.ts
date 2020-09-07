export default interface Job {
    tag: string;
    code: string;
    options?: object;
}

export interface SchedulerOptions {
    size: number;
}
