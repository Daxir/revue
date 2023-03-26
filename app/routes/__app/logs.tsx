import {
  Container,
  Grid,
  NativeSelect,
  Group,
  TextInput,
  Title,
  Table,
  Text,
  Popover,
  Button,
  Checkbox,
} from "@mantine/core"
import {
  Form,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { useDebouncedState, useClickOutside, useDisclosure } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import { json } from "@remix-run/node";
import type { EventLog, EventLogContent} from "~/models/eventlog.server";
import { findEventLogs} from "~/models/eventlog.server";
import { EmptyState } from "~/components/EmptyState";
import type { FormEvent } from "react";
import { IconSearch, IconArrowNarrowUp, IconArrowNarrowDown} from "@tabler/icons";

function getEventLogParsedContent(log: EventLog) {
  return { ...log, content: log.content as EventLogContent };
}

function getStringDate(year: string, month : string,  days : string) {
  let result = "";
  if (year !== "-" && year !== undefined && month !== "-" && month !== undefined && days !== "-" && days !== undefined) {
    result = year + "-" + month + "-" + days;
  }
  return result;
}

function getMonths(isYear: string) {
  let result = 12
  if (isYear === "-") {
    result = 0;
  }
  return result;
}

function getDays(month : string) {
  let result = 0;

  if (month === "1" || month === "3" || month === "5"
    || month === "7" || month === "8" || month === "10" || month === "12") {
    result = 31;
  }

  if (month === "4" || month === "6" || month === "9" || month === "11") {
    result = 30;
  }

  if (month === "2") {
    result = 28;
  }

  return result;
}

export async function loader({ request }: LoaderArgs) { 

  const url = new URL(request.url);
  const { search, prevYear, prevMonth, prevDays, nextYear, nextMonth, nextDays } = Object.fromEntries(
    url.searchParams.entries(),
  );
  const prevdate = getStringDate(prevYear, prevMonth, prevDays);
  const nextdate = getStringDate(nextYear, nextMonth, nextDays);

  const previousMonthCount = getMonths(prevYear);
  const nextMonthCount = getMonths(nextYear);

  const previousDaysCount = getDays(prevMonth);
  const nextDaysCount = getDays(nextMonth);
  const categoriesQuery = url.searchParams.getAll("categories");
  
  let searchArray = [''];
  if (search !== undefined) {
    searchArray = search.split(', ');
    if (searchArray.length > 1 && searchArray[searchArray.length - 1] === '') {
      searchArray.pop();
    }
  }

  const eventlogs = await findEventLogs(searchArray, prevdate, nextdate, categoriesQuery);

  const parsedEventLogs = eventlogs.map((log) => {
    return getEventLogParsedContent(log);
  })

  const strippedLogs = parsedEventLogs.map(({ eventLogId,
    eventLogDate,
    userId,
    content,
  }) => {
    return {
      eventLogId, 
      eventLogDate: eventLogDate.toDateString(),
      eventLogTime: eventLogDate.toLocaleTimeString(),
      userId,
      descrtiption: content.description
    }
     })
  
  const uniqueDates = [... new Set(strippedLogs.map((item) => item.eventLogDate))];
  
  const logDates = uniqueDates.map((value) => {
    return {
      dates: value,
    }
  })
  
  return json({
    logs: strippedLogs.reverse(),
    logDates: logDates.reverse(),
    prevMonthCount: previousMonthCount,
    nextMonthCount: nextMonthCount,
    prevDaysCount: previousDaysCount,
    nextDaysCount: nextDaysCount
  });
}

function getArrays(count: number) {
  const result = ["-"];

  for (const index of Array.from({ length: count }, (_, index_) => index_ + 1)) {
    result.push(index.toString());
  }

  return result;
}

export default function EventLogsPage() {

  const { logs, logDates, prevMonthCount, nextMonthCount, prevDaysCount, nextDaysCount } = useLoaderData<typeof loader>();

  const previousDays = getArrays(prevDaysCount);
  const nextDays = getArrays(nextDaysCount);

  const previousMonths = getArrays(prevMonthCount);
  const nextMonths = getArrays(nextMonthCount);

  const [searchQuery, setSearchQuery] = useDebouncedState("", 500);
  const submit = useSubmit();
  const formReference = useRef<HTMLFormElement>(null);
  const [isVisible, helpers] = useDisclosure(false);
  const reference = useClickOutside(helpers.close);
  useEffect(() => {
    if (formReference.current) {
      submit(formReference.current);
    }
  }, [submit, searchQuery]);

  function handleChange(event: FormEvent<HTMLFormElement>) {
    submit(event.currentTarget);
  }
  const data = [
    { value: "CP", label: "Create Product" },
    { value: "UP", label: "Update Product" },
    { value: "CU", label: "Create User" },
    { value: "UU", label: "Update User" },
    { value: "DU", label: "Delete User" },
    { value: "CR", label: "Create Review" },
    { value: "UR", label: "Update Review" },]

  return (
    <Container style={{ width: "100%" }} size="xl">
        <Title order={4} mb={5}>
            Event Log
        </Title>
        <Form
        method="get"
        action="/logs"
        onChange={handleChange}
        ref={formReference}
        >  
          <Grid align="flex-end">
            <Grid.Col span={5}>
              <TextInput
                icon={<IconSearch size={14}/>}
                label="Search"
                name="search"
                placeholder="Keywords"
                type="search"
              onChange={(event) => {
                event.stopPropagation();
                setSearchQuery(event.currentTarget.value);
              }}
              />
          </Grid.Col>
          <Grid.Col span="content">
            <NativeSelect
              data={["-", "2022", "2023"]}
              name="prevYear"
              label="From:"
            />
          </Grid.Col>
          <Grid.Col span="content">
            <NativeSelect
              data={previousMonths}
              name="prevMonth"
            />
          </Grid.Col>
          <Grid.Col span="content">
            <NativeSelect
              data={previousDays}
              name="prevDays"
            />
          </Grid.Col>
          <Grid.Col span="content">
            <Text>
              -
            </Text>
          </Grid.Col>
          <Grid.Col span="content">
            <NativeSelect
              data={["-", "2022", "2023"]}
              name="nextYear"
              label="Until:"
            />
          </Grid.Col>
          <Grid.Col span="content">
            <NativeSelect
              data={nextMonths}
              name="nextMonth"
            />
          </Grid.Col>
          <Grid.Col span="content">
            <NativeSelect
              data={nextDays}
              name="nextDays"
            />
          </Grid.Col>

          <Grid.Col span="content">
                          <Container ref={reference}>
              <Popover opened>
                {/* Popover is always opened to prevent dismounting and losing form data */}
                <Popover.Target>
                  <Button
                    onClick={helpers.toggle}
                    variant="subtle"
                    rightIcon={
                      isVisible ? <IconArrowNarrowUp /> : <IconArrowNarrowDown />
                    }
                  >
                    Filter categories
                  </Button>
                </Popover.Target>
                <Popover.Dropdown
                  sx={{
                    display: isVisible ? "block" : "none",
                  }}
                >
                  <Checkbox.Group orientation="vertical">
                      {data.map((item) => (
                        <Checkbox
                          name="categories"
                          mb={10}
                          key={item.value}
                          label={item.label}
                          value={item.value}
                        />
                    ))}
                  </Checkbox.Group>
                </Popover.Dropdown>
              </Popover>
            </Container>
          </Grid.Col>
          </Grid>
        </Form>

          
            { logDates.length > 0 ? (
              logDates.map(({ dates }) => (
                <Group key={dates} position="center" align="baseline">
                  <Table horizontalSpacing="md"
                  verticalSpacing="xs"
                  sx={{ tableLayout: "auto", minWidth: 700}}>
                    <Text>
                    {dates}
                    </Text>
                    <tbody>
                      {logs.map((value) => (
                        value.eventLogDate === dates ? (
                          <tr key={value.eventLogId}>
                            <td width={"150px"}>
                              {value.eventLogTime}
                            </td>
                            <td width={"px | %"}>
                              {value.descrtiption}
                            </td> 
                          </tr>
                        ) : null
                      ))}
                    </tbody>
                  </Table>
                </Group>
          ),      
          )) : (

                    <EmptyState
                      title="No logs found..."
                      description="You can create a new log."
                    />
                  )}

    </Container>
  );
};