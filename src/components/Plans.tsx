import { useUser } from "@/hooks/user";
import { formatDateAndTime } from "@/utils/date";
import { useMutation, useQuery } from "convex/react";
import { Clock, Crown, MapPin, User } from "lucide-react";

import { api } from "../../convex/_generated/api";

import { AddPlan } from "./AddPlan";
import { Accordion } from "./ui/Accordion";
import { Button } from "./ui/Button";
import { Label } from "./ui/Label";

export function Plans() {
    const plans = useQuery(api.plans.getPlans);
    const allUsers = useQuery(api.users.getUsers);
    const joinPlan = useMutation(api.plans.addUserToPlan);
    const deletePlan = useMutation(api.plans.deletePlan);
    const removeUserFromPlan = useMutation(api.plans.removeUserFromPlan);
    const user = useUser();
    const hasPlans = plans && plans.length > 0;

    function isUserPlan(planUser?: string) {
        return planUser === user?._id;
    }

    function getUserFromId(userId?: string) {
        return allUsers?.find((user) => user._id === userId);
    }

    function isAttending(attendees: string[]) {
        return attendees.some((attendee) => attendee === user?._id);
    }

    return (
        <div className="rounded-lg bg-white p-6 text-black shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Guttas planer</h2>
            <div className="flex justify-end">
                <AddPlan />
            </div>
            {!hasPlans ? (
                <p className="mb-4 text-lg font-bold">Ingen planer lagt til enda</p>
            ) : (
                <ul className="flex flex-col gap-4">
                    {plans.map((plan) => {
                        return (
                            <div key={plan._id}>
                                <Accordion
                                    header={
                                        <div className="flex w-full gap-4">
                                            <div className="flex w-full flex-wrap gap-4">
                                                <div className="flex items-end gap-2">
                                                    <Clock />
                                                    <p className="max-w-25">{formatDateAndTime(plan.date, "no")}</p>
                                                </div>
                                                <div className="flex items-end gap-2">
                                                    <MapPin />
                                                    <p>{plan.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="flex w-full flex-col gap-2 border-t border-t-stone-300">
                                        <span className="block h-2" />
                                        <div className="flex w-full justify-between">
                                            <p>{plan.plan}</p>
                                            <div className="flex flex-col items-end gap-2 lg:flex-row">
                                                <Crown />
                                                <p>{getUserFromId(plan.userId)?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 border-t border-t-stone-300">
                                        <span className="block h-2" />
                                        <div className="flex w-full justify-between">
                                            <Label>Påmeldte</Label>
                                            {isUserPlan(plan.userId) && (
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => void deletePlan({ planId: plan._id })}
                                                >
                                                    Slette plan?
                                                </Button>
                                            )}
                                        </div>
                                        {plan.attendees.map((userId) => {
                                            return (
                                                <div className="flex items-baseline gap-2">
                                                    <User />
                                                    <li> {getUserFromId(userId)?.name}</li>
                                                </div>
                                            );
                                        })}

                                        <div className="flex w-full justify-end gap-4">
                                            <Button
                                                disabled={isAttending(plan.attendees)}
                                                className="w-fit"
                                                onClick={() => void joinPlan({ userId: user?._id || "", id: plan._id })}
                                            >
                                                Keen?
                                            </Button>
                                            <Button
                                                disabled={!isAttending(plan.attendees)}
                                                variant="secondary"
                                                className="w-fit"
                                                onClick={() =>
                                                    void removeUserFromPlan({ id: plan._id, userId: user?._id || "" })
                                                }
                                            >
                                                Ukeen?
                                            </Button>
                                        </div>
                                    </div>
                                </Accordion>
                            </div>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
