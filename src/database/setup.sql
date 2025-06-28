CREATE TRIGGER ensure_single_active_before_update BEFORE UPDATE OF active ON prompt WHEN NEW.active = 1
BEGIN
  UPDATE prompt
  SET active = 0
  WHERE active = 1 AND id != NEW.id;
END;

CREATE TRIGGER ensure_single_active_before_insert BEFORE INSERT OF active ON prompt WHEN NEW.active = 1
BEGIN
  UPDATE prompt
  SET active = 0
  WHERE active = 1 AND id != NEW.id;
END;
