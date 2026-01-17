import { useUser } from "@/hooks/user";
import { endOfDay, formatDateAndTime } from "@/utils/date";
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

    const plansAfterToday = plans?.filter((plan) => new Date(endOfDay(plan.date)) >= new Date());

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
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-black shadow-sm lg:p-6">
            <h2 className="mb-4 text-2xl font-bold">Guttas kommende planer</h2>
            <div className="flex justify-end">
                <AddPlan />
            </div>
            {!hasPlans ? (
                <p className="mb-4 text-lg font-bold">Ingen planer lagt til enda</p>
            ) : (
                <ul className="flex flex-col gap-4">
                    {plans.map((plan, index) => {
                        return (
                            <div key={plan._id + index}>
                                <Accordion
                                    header={
                                        <div className="flex w-full gap-4">
                                            <div className="flex w-full flex-wrap gap-4">
                                                <div className="flex items-end gap-2">
                                                    <Clock className="shrink-0" />
                                                    <p>{formatDateAndTime(plan.date, "no", "medium", true)}</p>
                                                </div>
                                                <div className="flex min-w-0 items-end gap-2">
                                                    <MapPin className="shrink-0" />
                                                    <p className="">{plan.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="flex w-full flex-col gap-2 border-t border-t-stone-300 py-2">
                                        <div className="flex w-full flex-col justify-end gap-2">
                                            <div className="mb-2 flex items-end gap-2">
                                                <Crown />
                                                <Label>{getUserFromId(plan.userId)?.name}</Label>
                                            </div>
                                            <p>{plan.plan}</p>
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
                                                <div key={userId} className="flex items-baseline gap-2">
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
