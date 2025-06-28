class SqlBuild {
  public static setClaude<T>(id: string, changes: T): string {
    const keys = Object.keys(changes);
    const setClause = keys.map(key => `${key} = :${key}`).join(', ');
    const values = keys.map(key => changes[key as keyof T]);
    values.push(id);
    return setClause;
  }
}

export { SqlBuild };
